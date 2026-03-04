import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Card, Badge, Alert } from './UI';

describe('UI Components', () => {
  describe('Button Component', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should call onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click</Button>);

      await userEvent.click(screen.getByText('Click'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply primary variant styles', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('should apply danger variant styles', () => {
      const { container } = render(<Button variant="danger">Delete</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-red-600');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByText('Disabled Button')).toBeDisabled();
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <Button onClick={handleClick} disabled>
          Click
        </Button>
      );

      await userEvent.click(screen.getByText('Click'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Card Component', () => {
    it('should render card with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should have border and shadow', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('div');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('shadow-sm');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <Card className="custom-class">Content</Card>
      );
      const card = container.querySelector('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Badge Component', () => {
    it('should render badge with text', () => {
      render(<Badge>Online</Badge>);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should apply default variant styles', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-gray-100');
    });

    it('should apply success variant styles', () => {
      const { container } = render(<Badge variant="success">Healthy</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('should apply danger variant styles', () => {
      const { container } = render(<Badge variant="danger">Critical</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(<Badge variant="warning">Warning</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100');
    });

    it('should have inline-flex display', () => {
      const { container } = render(<Badge>Badge</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex');
    });
  });

  describe('Alert Component', () => {
    it('should render alert with message', () => {
      render(<Alert>Test alert message</Alert>);
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('should render alert with info variant', () => {
      const { container } = render(
        <Alert variant="info">Info message</Alert>
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-blue-50');
    });

    it('should render alert with success variant', () => {
      const { container } = render(
        <Alert variant="success">Success</Alert>
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-green-50');
    });

    it('should render alert with error variant', () => {
      const { container } = render(
        <Alert variant="error">Error</Alert>
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-red-50');
    });

    it('should render alert with warning variant', () => {
      const { container } = render(
        <Alert variant="warning">Warning</Alert>
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-yellow-50');
    });

    it('should have rounded and padding styles', () => {
      const { container } = render(<Alert>Alert</Alert>);
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('p-4');
    });
  });
});
