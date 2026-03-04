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

    it('should render card with header', () => {
      render(
        <Card header="Card Title">
          Card content
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card with footer', () => {
      render(
        <Card footer="Footer text">
          Card content
        </Card>
      );
      expect(screen.getByText('Footer text')).toBeInTheDocument();
    });

    it('should render card with header and footer', () => {
      render(
        <Card header="Title" footer="Footer">
          Content
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Badge Component', () => {
    it('should render badge with label', () => {
      render(<Badge label="Online" />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should apply default variant styles', () => {
      const { container } = render(<Badge label="Default" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-blue-100');
    });

    it('should apply danger variant styles', () => {
      const { container } = render(<Badge label="Critical" variant="danger" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('should apply success variant styles', () => {
      const { container } = render(<Badge label="Healthy" variant="success" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('should apply warning variant styles', () => {
      const { container } = render(<Badge label="Warning" variant="warning" />);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-yellow-100');
    });
  });

  describe('Alert Component', () => {
    it('should render alert with message', () => {
      render(<Alert message="Test alert message" />);
      expect(screen.getByText('Test alert message')).toBeInTheDocument();
    });

    it('should render alert with info variant', () => {
      const { container } = render(
        <Alert message="Info" variant="info" />
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-blue-50');
    });

    it('should render alert with success variant', () => {
      const { container } = render(
        <Alert message="Success" variant="success" />
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-green-50');
    });

    it('should render alert with danger variant', () => {
      const { container } = render(
        <Alert message="Error" variant="danger" />
      );
      const alert = container.querySelector('div');
      expect(alert).toHaveClass('bg-red-50');
    });
  });
});
