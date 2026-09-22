import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        monthlyBudget: {
            type: Number,
            min: [0, "Monthly budget cannot be negative"],
            default: null,
        },
        yearlyBudget: {
            type: Number,
            min: [0, "Yearly budget cannot be negative"],
            default: null,
        },
        color: {
            type: String,
            default: '#6366f1', // Indigo color
            trim: true,
        },
        icon: {
            type: String,
            default: '💰',
            trim: true,
        },
        isSystem: {
            type: Boolean,
            default: false,
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Compound unique index: category name must be unique per user
expenseCategorySchema.index({ name: 1, userId: 1 }, { unique: true });

// Index for active categories
expenseCategorySchema.index({ userId: 1, isActive: 1 });

// Virtual for budget utilization (calculated at runtime)
expenseCategorySchema.virtual('budgetUtilization').get(function () {
    // This will be populated by the controller when needed
    return null;
});

// Static method to get default categories
expenseCategorySchema.statics.getDefaultCategories = function () {
    return [
        { name: 'Tea & Refreshments (چائے و ریفریشمنٹ)', icon: '☕', color: '#b45309', description: 'Daily tea, biscuits, water, refreshments for customers & staff' },
        { name: 'Electricity & Generator Fuel (بجلی بل و فیول)', icon: '⚡', color: '#eab308', description: 'WAPDA/K-Electric bill, generator petrol/diesel, UPS batteries, solar' },
        { name: 'Shop & Godown Rent (دکان و گودام کرایہ)', icon: '🏬', color: '#ef4444', description: 'Monthly shop rent, godown/warehouse rent' },
        { name: 'Staff Salaries & Mazdoori (ملازمین کی تنخواہ و دیہاڑی)', icon: '👥', color: '#10b981', description: 'Monthly salaries, daily labor (mazdoori), salesman commission' },
        { name: 'Freight & Delivery / Carriage (کرایہ باربرداری و ڈلیوری)', icon: '🚚', color: '#3b82f6', description: 'Goods transport, Rickshaw/Suzuki fare, delivery riders, carriage in/out' },
        { name: 'Packaging Bags & Stationery (شاپر لفافے و اسٹیشنری)', icon: '🛍️', color: '#ec4899', description: 'Polythene bags (lifafey), packing tape, boxes, bill books, register' },
        { name: 'Shop Repair & Maintenance (دکان و مرمت)', icon: '🔧', color: '#14b8a6', description: 'Electrician, shutter repair, AC/fan service, display racks, fixture repairs' },
        { name: 'Internet & Mobile Bills (انٹرنیٹ و موبائل بل)', icon: '📱', color: '#8b5cf6', description: 'Shop WiFi, mobile balance, telephone packages' },
        { name: 'Cleaning, Committee & Security (صفائی، سیکیورٹی و کمیٹی)', icon: '🧹', color: '#f97316', description: 'Market sweeper (safai), market union/anjuman subscription, security guard' },
        { name: 'Charity & Sadqah (صدقہ، خیرات و چندہ)', icon: '🤲', color: '#059669', description: 'Daily morning sadqah, mosque chanda, charity' },
        { name: 'Taxes, Challan & Govt Fees (ٹیکس، چالان و سرکاری فیس)', icon: '📋', color: '#6366f1', description: 'FBR/PRA tax, municipal/board fees, sign board tax, trade license, challans' },
        { name: 'Miscellaneous Expenses (متفرق اخراجات)', icon: '📦', color: '#64748b', description: 'Other daily miscellaneous petty cash and operational expenses' },
    ];
};

// Static method to seed default categories for a user
expenseCategorySchema.statics.seedDefaultCategories = async function (userId) {
    const defaultCategories = this.getDefaultCategories();

    const categoriesToCreate = defaultCategories.map(cat => ({
        ...cat,
        userId,
        isSystem: true,
        isActive: true,
    }));

    try {
        // Use insertMany with ordered: false to continue on duplicate key errors
        await this.insertMany(categoriesToCreate, { ordered: false });
    } catch (error) {
        // Ignore duplicate key errors (categories already exist)
        if (error.code !== 11000) {
            throw error;
        }
    }
};

// Prevent deletion of system categories
expenseCategorySchema.pre('deleteOne', { document: true, query: false }, function (next) {
    if (this.isSystem) {
        return next(new Error('Cannot delete system category'));
    }
    next();
});

// Prevent deletion of system categories (for findOneAndDelete)
expenseCategorySchema.pre('findOneAndDelete', async function (next) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && doc.isSystem) {
        return next(new Error('Cannot delete system category'));
    }
    next();
});

const ExpenseCategory = mongoose.model("ExpenseCategory", expenseCategorySchema);
export default ExpenseCategory;
