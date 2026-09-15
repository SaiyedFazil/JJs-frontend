import { useCartStore } from '../src/store/cart.store';

const line = { id: 'tandoori-chicken', name: 'Tandoori Chicken', price: 499 };

beforeEach(() => useCartStore.getState().clearCart());

describe('addItem', () => {
  it('adds a new line at quantity 1', () => {
    useCartStore.getState().addItem(line);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(1);
  });

  it('increments an existing line rather than duplicating it', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(2);
  });
});

describe('decrementItem', () => {
  it('decrements by one', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    useCartStore.getState().decrementItem(line.id);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(1);
  });

  it('drops the line at zero', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().decrementItem(line.id);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('is a no-op for an id not in the cart', () => {
    useCartStore.getState().decrementItem('not-here');
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('totals', () => {
  it('totalAmount multiplies price by quantity across lines', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem({ id: 'butter-garlic-naan', name: 'Butter Garlic Naan', price: 90 });
    expect(useCartStore.getState().totalAmount()).toBe(1088);
    expect(useCartStore.getState().totalItems()).toBe(3);
  });

  it('is zero on an empty cart', () => {
    expect(useCartStore.getState().totalAmount()).toBe(0);
  });
});

describe('quantityOf', () => {
  it('returns 0 for an absent id', () => {
    expect(useCartStore.getState().quantityOf('not-here')).toBe(0);
  });
});
