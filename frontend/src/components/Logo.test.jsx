import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo Component', () => {
    it('renders standalone large purple MT. logo without container', () => {
        const { container } = render(<Logo size="lg" noContainer={true} showText={true} />);
        
        expect(screen.getByLabelText(/MegaTrix Logo/i)).toBeInTheDocument();
        expect(screen.getByText('BizManager')).toBeInTheDocument();
        expect(screen.getByText('BY MEGATRIX')).toBeInTheDocument();
        
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('text-violet-600');
    });

    it('renders with hoverSlide container and classes', () => {
        const { container } = render(<Logo size="lg" hoverSlide={true} />);
        
        const groupContainer = container.firstChild;
        expect(groupContainer).toHaveClass('group');
        expect(groupContainer).toHaveClass('cursor-pointer');
        
        const textContainer = container.querySelector('.group-hover\\:max-w-\\[450px\\]');
        expect(textContainer).toBeInTheDocument();
        expect(textContainer).toHaveClass('max-w-0');
        expect(textContainer).toHaveClass('opacity-0');
    });
});
