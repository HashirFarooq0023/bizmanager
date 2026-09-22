import mongoose from "mongoose";
import Return from "../models/Return.js";
import Invoice from "../models/Invoice.js";
import Item from "../models/Item.js";
import Customer from "../models/Customer.js";
import Transaction from "../models/Transaction.js";
import CashbankTransaction from "../models/CashbankTransaction.js";
import { info, error } from "../utils/logger.js";

/**
 * @desc Create a new return
 * @route POST /api/returns
 */
export const createReturn = async (req, res) => {
    try {
        const {
            invoiceId,
            items,
            refundMethod = "credit",
            discountAmount = 0,
            notes = "",
        } = req.body;

        info('=== CREATE RETURN REQUEST ===');
        info('Received refundMethod:', { refundMethod });
        info('InvoiceId:', { invoiceId });

        // Validate input
        if (!invoiceId || !items || items.length === 0) {
            return res.status(400).json({
                message: "Invoice ID and items are required",
            });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return res.status(400).json({ message: "Invalid invoice ID format" });
        }

        // Fetch and verify invoice belongs to current user
        const invoice = await Invoice.findOne({
            _id: invoiceId,
            createdBy: req.user._id,
        }).populate("customer").populate("bankAccount");

        if (!invoice) {
            return res.status(404).json({
                message: "Invoice not found or unauthorized",
            });
        }

        // ========== ORIGINAL PAYMENT DETECTION ==========
        let actualRefundMethod = refundMethod;
        let detectedPaymentInfo = null;
        let refundBankAccount = req.body.bankAccount;

        if (refundMethod === 'original_payment') {
            // Capture original payment details
            detectedPaymentInfo = {
                paymentMethod: invoice.paymentMethod,
                paidViaMethod: invoice.paidViaMethod,
                creditApplied: invoice.creditApplied || 0,
                paidAmount: invoice.paidAmount || 0,
                splitPaymentDetails: invoice.splitPaymentDetails || [],
                bankAccount: invoice.bankAccount?._id || invoice.bankAccount,
            };

            // Determine actual refund method based on original payment
            if (invoice.paymentMethod === 'split') {
                // For split payments, default to credit for simplicity
                // Could be enhanced to split refund across methods
                actualRefundMethod = 'credit';
                info(`Split payment detected for return. Refunding as credit.`);
            } else if (invoice.paymentMethod === 'credit') {
                // Pure credit payment - refund as credit
                actualRefundMethod = 'credit';
            } else if (invoice.paymentMethod === 'bank_transfer') {
                // Bank transfer - refund to same bank account
                actualRefundMethod = 'bank_transfer';
                refundBankAccount = detectedPaymentInfo.bankAccount;

                if (!refundBankAccount) {
                    return res.status(400).json({
                        message: "Original bank account not found. Cannot process refund via original payment method."
                    });
                }
            } else if (invoice.paymentMethod === 'cash') {
                // Cash payment - refund as cash
                actualRefundMethod = 'cash';
            } else if (invoice.paymentMethod === 'upi' || invoice.paymentMethod === 'card') {
                // UPI/Card cannot be directly refunded - convert to credit
                actualRefundMethod = 'credit';
                info(`Original payment was ${invoice.paymentMethod}. Refunding as credit.`);
            } else {
                // Default fallback
                actualRefundMethod = invoice.paymentMethod || 'credit';
            }

            info(`Original payment detection: ${invoice.paymentMethod} → Refunding as: ${actualRefundMethod}`);
        } else {
            info('Original payment NOT selected, using refundMethod:', { refundMethod });
        }

        info('FINAL actualRefundMethod:', { actualRefundMethod });
        info('FINAL refundBankAccount:', { refundBankAccount });

        // Check for existing returns for this invoice
        const existingReturns = await Return.find({
            invoice: invoiceId,
            createdBy: req.user._id,
        });

        // Calculate already returned quantities per product
        const returnedQuantities = {};
        existingReturns.forEach((returnRecord) => {
            returnRecord.items.forEach((item) => {
                const productId = item.product.toString();
                if (!returnedQuantities[productId]) {
                    returnedQuantities[productId] = 0;
                }
                returnedQuantities[productId] += item.returnedQty;
            });
        });

        // Validate all return items
        for (const returnItem of items) {
            // Find matching item in original invoice
            const invoiceItem = invoice.items.find(
                (invItem) => invItem.item.toString() === returnItem.productId
            );

            if (!invoiceItem) {
                return res.status(400).json({
                    message: `Product ${returnItem.productName} not found in original invoice`,
                });
            }

            // Check if this item has already been returned
            const alreadyReturned = returnedQuantities[returnItem.productId] || 0;
            const totalReturnQty = alreadyReturned + returnItem.returnedQty;

            // Validate total returned quantity doesn't exceed original quantity
            if (totalReturnQty > invoiceItem.quantity) {
                return res.status(400).json({
                    message: `Cannot return ${returnItem.returnedQty} of ${returnItem.productName}. Original quantity: ${invoiceItem.quantity}, Already returned: ${alreadyReturned}, Remaining: ${invoiceItem.quantity - alreadyReturned}`,
                });
            }

            if (returnItem.returnedQty <= 0) {
                return res.status(400).json({
                    message: `Return quantity must be greater than 0 for ${returnItem.productName}`,
                });
            }

            // Validate condition and reason
            if (!returnItem.condition || !returnItem.reason) {
                return res.status(400).json({
                    message: `Condition and reason are required for ${returnItem.productName}`,
                });
            }
        }

        // Calculate totals
        let subtotal = 0;
        let taxAmount = 0;

        const processedItems = [];

        for (const returnItem of items) {
            const lineSubtotal = returnItem.returnedQty * returnItem.rate;
            const lineTax = (lineSubtotal * returnItem.taxPercent) / 100;
            const lineTotal = lineSubtotal + lineTax;

            subtotal += lineSubtotal;
            taxAmount += lineTax;

            processedItems.push({
                product: returnItem.productId,
                productName: returnItem.productName,
                originalQty: returnItem.originalQty,
                returnedQty: returnItem.returnedQty,
                rate: returnItem.rate,
                taxPercent: returnItem.taxPercent,
                taxAmount: lineTax,
                lineTotal: lineTotal,
                condition: returnItem.condition,
                reason: returnItem.reason,
                inventoryAdjusted: false,
            });
        }

        const totalReturnAmount = subtotal + taxAmount - discountAmount;

        // Determine return type
        let isFullReturn = true;
        for (const returnItem of items) {
            const invoiceItem = invoice.items.find(
                (invItem) => invItem.item.toString() === returnItem.productId
            );
            if (returnItem.returnedQty < invoiceItem.quantity) {
                isFullReturn = false;
                break;
            }
        }

        // Check if all invoice items are being returned
        if (isFullReturn && items.length < invoice.items.length) {
            isFullReturn = false;
        }

        const returnType = isFullReturn ? "full" : "partial";

        // Generate unique return ID
        const lastReturn = await Return.findOne({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .select("returnId");

        let returnNumber = 1;
        if (lastReturn && lastReturn.returnId) {
            const match = lastReturn.returnId.match(/RET-(\d+)/);
            if (match) {
                returnNumber = parseInt(match[1]) + 1;
            }
        }

        const returnId = `RET-${String(returnNumber).padStart(5, "0")}`;

        // Calculate net items total and amount paid specifically toward items (excluding past dues)
        const itemsNetTotal = Math.max(0, (invoice.subtotal || 0) - (invoice.discount || 0));
        const effectivePaid = (invoice.paidAmount || 0) + (invoice.creditApplied || 0);

        // Amount paid toward new goods on this invoice
        const paidTowardItems = Math.min(effectivePaid, itemsNetTotal);

        // Unpaid due that was added to customer ledger for these items
        const unpaidDueForItems = Math.max(0, itemsNetTotal - paidTowardItems);

        // 1. Portion of return that auto-settles unpaid customer due on this invoice
        const unpaidToCancel = invoice.customer ? Math.min(totalReturnAmount, unpaidDueForItems) : 0;

        // 2. Portion of return that represents money actually paid by the customer to be refunded
        const actualRefundAmount = Math.max(0, totalReturnAmount - unpaidToCancel);

        // Create return record
        const returnRecord = await Return.create({
            returnId,
            invoice: invoiceId,
            customer: invoice.customer?._id || null,
            customerName: invoice.customer?.name || "Walk-in Customer",
            returnDate: new Date(),
            returnType,
            refundMethod, // What user selected (e.g., 'original_payment')
            actualRefundMethod, // What we actually used (e.g., 'cash', 'bank_transfer')
            originalPaymentInfo: detectedPaymentInfo, // For audit trail
            bankAccount: refundBankAccount,
            items: processedItems,
            subtotal,
            taxAmount,
            discountAmount,
            totalReturnAmount,
            unpaidSettledAmount: unpaidToCancel,
            actualRefundAmount: actualRefundAmount,
            status: "processed",
            notes,
            createdBy: req.user._id,
        });

        // Update inventory for non-damaged items
        for (const returnItem of processedItems) {
            if (returnItem.condition === "not_damaged") {
                await Item.findByIdAndUpdate(returnItem.product, {
                    $inc: { stockQty: returnItem.returnedQty },
                });

                // Mark inventory as adjusted
                await Return.findOneAndUpdate(
                    { _id: returnRecord._id, "items.product": returnItem.product },
                    { $set: { "items.$.inventoryAdjusted": true } }
                );
            }
        }

        // Update invoice
        await Invoice.findByIdAndUpdate(invoiceId, {
            $inc: { returnedAmount: totalReturnAmount },
            $set: { hasReturns: true },
        });

        // 1. AUTO-SETTLE UDHAAR: Cancel the unpaid due for the returned items
        if (invoice.customer && unpaidToCancel > 0) {
            await Customer.findByIdAndUpdate(invoice.customer._id, {
                $inc: { dues: -unpaidToCancel },
            });

            try {
                await Transaction.create({
                    type: "due",
                    customer: invoice.customer._id,
                    invoice: invoiceId,
                    return: returnRecord._id,
                    amount: -unpaidToCancel,
                    description: `Udhaar auto-settled for returned items on invoice ${invoice.invoiceNo} - Return ID: ${returnId}`,
                });
            } catch (txnErr) {
                error(`Return udhaar settlement transaction failed (non-blocking): ${txnErr.message}`);
            }
        }

        // 2. REFUND OF ACTUALLY PAID AMOUNT (Money back to customer or store credit)
        if (actualRefundAmount > 0) {
            if (invoice.customer && actualRefundMethod === 'credit') {
                // Customer wants store credit / further reduction in dues
                await Customer.findByIdAndUpdate(invoice.customer._id, {
                    $inc: { dues: -actualRefundAmount },
                });

                try {
                    await Transaction.create({
                        type: "return",
                        customer: invoice.customer._id,
                        invoice: invoiceId,
                        return: returnRecord._id,
                        amount: actualRefundAmount,
                        paymentMethod: "credit",
                        description: `Store credit added for returned items on invoice ${invoice.invoiceNo} - Return ID: ${returnId}`,
                    });
                } catch (txnErr) {
                    error(`Return credit transaction failed (non-blocking): ${txnErr.message}`);
                }
            } else if (actualRefundMethod === 'bank_transfer' && refundBankAccount) {
                // Bank refund of actual paid amount
                try {
                    const BankAccount = (await import("../models/BankAccount.js")).default;
                    const CashbankTransactionDyn = (await import("../models/CashbankTransaction.js")).default;

                    const bankAcc = await BankAccount.findOne({
                        _id: refundBankAccount,
                        userId: req.user._id
                    });

                    if (bankAcc) {
                        const cashbankTxn = await CashbankTransactionDyn.create({
                            type: 'out',
                            amount: actualRefundAmount,
                            fromAccount: refundBankAccount,
                            toAccount: 'sale_return',
                            description: `Bank refund for sales return ${returnId}`,
                            date: new Date(),
                            userId: req.user._id,
                        });

                        await BankAccount.updateOne(
                            { _id: refundBankAccount, userId: req.user._id },
                            {
                                $inc: { currentBalance: -actualRefundAmount },
                                $push: { transactions: cashbankTxn._id }
                            }
                        );

                        returnRecord.refundProcessed = true;
                        await returnRecord.save();
                    }
                } catch (bankErr) {
                    error(`Bank refund processing failed (non-blocking): ${bankErr.message}`);
                }
            } else if (actualRefundMethod === 'cash') {
                // Cash refund of actual paid amount
                try {
                    await CashbankTransaction.create({
                        type: 'out',
                        amount: actualRefundAmount,
                        fromAccount: 'cash',
                        toAccount: 'sale_return',
                        description: `Cash refund for sales return ${returnId}`,
                        userId: req.user._id,
                        date: new Date(),
                    });
                } catch (cashErr) {
                    error(`Cash refund processing failed (non-blocking): ${cashErr.message}`);
                }
            }
        }

        info(
            `Return created by ${req.user.name}: ${returnId} for invoice ${invoice.invoiceNo}`
        );

        // Populate and return the created return (best-effort)
        try {
            const populatedReturn = await Return.findById(returnRecord._id)
                .populate("invoice", "invoiceNo")
                .populate("customer", "name phone email");

            return res.status(201).json({
                message: "Return created successfully",
                return: populatedReturn,
            });
        } catch (popErr) {
            error(`Return populate failed (non-blocking): ${popErr.message}`);
            return res.status(201).json({
                message: "Return created successfully",
                return: returnRecord,
            });
        }
    } catch (err) {
        error(`Create Return Error: ${err.message}`);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

/**
 * @desc Get all returns (only for current owner)
 * @route GET /api/returns
 */
export const getAllReturns = async (req, res) => {
    try {
        const returns = await Return.find({ createdBy: req.user._id })
            .populate("invoice", "invoiceNo")
            .populate("customer", "name phone")
            .sort({ createdAt: -1 });

        res.status(200).json(returns);
    } catch (err) {
        error(`Get All Returns Error: ${err.message}`);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

/**
 * @desc Get single return by ID
 * @route GET /api/returns/:id
 */
export const getReturnById = async (req, res) => {
    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid return ID format" });
        }

        const returnRecord = await Return.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        })
            .populate("invoice", "invoiceNo totalAmount")
            .populate("customer", "name phone email address")
            .populate("items.product", "name sku");

        if (!returnRecord) {
            return res.status(404).json({
                message: "Return not found or unauthorized",
            });
        }

        res.status(200).json(returnRecord);
    } catch (err) {
        error(`Get Return By ID Error: ${err.message}`);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

/**
 * @desc Delete return (reverses all changes)
 * @route DELETE /api/returns/:id
 */
export const deleteReturn = async (req, res) => {
    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid return ID format" });
        }

        const returnRecord = await Return.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
        });

        if (!returnRecord) {
            return res.status(404).json({
                message: "Return not found or unauthorized",
            });
        }

        // Attach for audit middleware (before deletion)
        req.deletedEntity = returnRecord.toObject();

        // Reverse inventory adjustments
        for (const item of returnRecord.items) {
            if (item.inventoryAdjusted && item.condition === "not_damaged") {
                await Item.findByIdAndUpdate(item.product, {
                    $inc: { stockQty: -item.returnedQty },
                });
            }
        }

        // Reverse invoice updates
        await Invoice.findByIdAndUpdate(returnRecord.invoice, {
            $inc: { returnedAmount: -returnRecord.totalReturnAmount },
        });

        // Check if invoice has other returns
        const otherReturns = await Return.countDocuments({
            invoice: returnRecord.invoice,
            _id: { $ne: returnRecord._id },
        });

        if (otherReturns === 0) {
            await Invoice.findByIdAndUpdate(returnRecord.invoice, {
                $set: { hasReturns: false },
            });
        }

        // Reverse customer ledger
        if (returnRecord.customer) {
            const duesReversal = (returnRecord.unpaidSettledAmount !== undefined)
                ? ((returnRecord.unpaidSettledAmount || 0) + (returnRecord.actualRefundMethod === 'credit' ? (returnRecord.actualRefundAmount || 0) : 0))
                : (returnRecord.actualRefundMethod === 'credit' ? returnRecord.totalReturnAmount : 0);

            if (duesReversal > 0) {
                await Customer.findByIdAndUpdate(returnRecord.customer, {
                    $inc: { dues: duesReversal },
                });
            }
        }

        // Handle Bank Refund Reversal
        if (returnRecord.refundProcessed && returnRecord.bankAccount) {
            const BankAccount = (await import("../models/BankAccount.js")).default;
            const CashbankTransaction = (await import("../models/CashbankTransaction.js")).default;

            const bankAcc = await BankAccount.findOne({
                _id: returnRecord.bankAccount,
                userId: req.user._id
            });

            if (bankAcc) {
                // Find and delete the associated cashbank transaction
                // We search by amount, account, and description to find the matching one
                const cashbankTxn = await CashbankTransaction.findOne({
                    amount: returnRecord.totalReturnAmount,
                    fromAccount: returnRecord.bankAccount,
                    type: 'out',
                    description: new RegExp(`sales return ${returnRecord.returnId}`),
                    userId: req.user._id
                });

                if (cashbankTxn) {
                    // Update bank balance (add back the money because 'out' is being reversed)
                    await BankAccount.updateOne(
                        { _id: returnRecord.bankAccount, userId: req.user._id },
                        {
                            $inc: { currentBalance: returnRecord.totalReturnAmount },
                            $pull: { transactions: cashbankTxn._id }
                        }
                    );

                    // Delete the cashbank transaction
                    await CashbankTransaction.findByIdAndDelete(cashbankTxn._id);

                    info(`Bank refund reversed for return ${returnRecord.returnId}: +Rs. ${returnRecord.totalReturnAmount} to ${bankAcc.bankName}`);
                }
            }
        }

        // Delete associated general transactions
        const Transaction = (await import("../models/Transaction.js")).default;
        await Transaction.deleteMany({ return: returnRecord._id });

        // Delete return record
        await Return.findByIdAndDelete(req.params.id);

        info(
            `Return deleted by ${req.user.name}: ${returnRecord.returnId}`
        );

        res.status(200).json({ message: "Return deleted successfully" });
    } catch (err) {
        error(`Delete Return Error: ${err.message}`);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
