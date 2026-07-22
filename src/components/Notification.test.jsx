import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notification from './Notification';

describe('Notification', () => {
  it('renders notification with message', () => {
    render(
      <Notification
        message="Test notification message"
        duration={3000}
        onDone={jest.fn()}
      />
    );
    expect(screen.getByText('Test notification message')).toBeInTheDocument();
  });

  it('returns null when message is empty', () => {
    const { container } = render(
      <Notification
        message=""
        duration={3000}
        onDone={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when message is not provided', () => {
    const { container } = render(
      <Notification
        duration={3000}
        onDone={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onDone after duration expires', async () => {
    const onDone = jest.fn();
    render(
      <Notification
        message="Test message"
        duration={100}
        onDone={onDone}
      />
    );
    
    // Wait for the timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(onDone).toHaveBeenCalled();
  });

  it('renders action button when actionLabel is provided', () => {
    render(
      <Notification
        message="Test message"
        duration={3000}
        onDone={jest.fn()}
        actionLabel="Undo"
        onAction={jest.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    render(
      <Notification
        message="Test message"
        duration={3000}
        onDone={jest.fn()}
        actionLabel="Undo"
        onAction={onAction}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Undo' });
    await user.click(button);
    expect(onAction).toHaveBeenCalled();
  });

  it('clears timeout on unmount', () => {
    const onDone = jest.fn();
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(
      <Notification
        message="Test message"
        duration={5000}
        onDone={onDone}
      />
    );
    
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

