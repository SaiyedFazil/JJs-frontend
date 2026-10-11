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

  it('adds several at once', () => {
    useCartStore.getState().addItem(line, 3);
    useCartStore.getState().addItem(line, 2);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(5);
  });

  it('keeps a customised line apart from the plain one, options intact', () => {
    const half = {
      id: 'tandoori-chicken|half||butter-naan|',
      name: 'Tandoori Chicken',
      price: 359,
      dishId: 'tandoori-chicken',
      options: {
        portion: 'half' as const,
        addOns: [
          {
            id: 'butter-naan',
            name: 'Extra Butter Naan',
            price: 80,
            veg: true,
          },
        ],
      },
    };
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(half, 2);

    const { items, totalAmount } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(items[1]).toEqual({ ...half, quantity: 2 });
    expect(totalAmount()).toBe(499 + 359 * 2);
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
    useCartStore.getState().addItem({
      id: 'butter-garlic-naan',
      name: 'Butter Garlic Naan',
      price: 90,
    });
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

const naan = { id: 'butter-naan', name: 'Butter Naan', price: 80 };
const jamun = { id: 'gulab-jamun', name: 'Gulab Jamun', price: 99 };
const ids = () => useCartStore.getState().items.map(i => i.id);

describe('restoreItem', () => {
  it('puts an undone line back where it was', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(naan, 2);
    useCartStore.getState().addItem(jamun);
    const removed = useCartStore.getState().items[1];

    useCartStore.getState().removeItem(naan.id);
    useCartStore.getState().restoreItem(removed, 1);

    expect(ids()).toEqual([line.id, naan.id, jamun.id]);
    expect(useCartStore.getState().quantityOf(naan.id)).toBe(2);
  });

  it('appends when the cart has since shrunk below that position', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().restoreItem({ ...naan, quantity: 1 }, 5);
    expect(ids()).toEqual([line.id, naan.id]);
  });

  it('merges into the line when it was re-added in the meantime', () => {
    useCartStore.getState().addItem(naan);
    useCartStore.getState().restoreItem({ ...naan, quantity: 2 }, 0);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().quantityOf(naan.id)).toBe(3);
  });
});

describe('replaceItem', () => {
  const half = {
    id: 'tandoori-chicken|half',
    name: 'Tandoori Chicken',
    price: 279,
    dishId: 'tandoori-chicken',
    options: { portion: 'half' as const, addOns: [] },
  };

  it('swaps an edited line for its new configuration, in place', () => {
    useCartStore.getState().addItem(naan);
    useCartStore.getState().addItem(half, 2);
    useCartStore.getState().addItem(jamun);

    useCartStore.getState().replaceItem(half.id, line, 3);

    expect(ids()).toEqual([naan.id, line.id, jamun.id]);
    expect(useCartStore.getState().items[1]).toEqual({ ...line, quantity: 3 });
  });

  it('merges into a line that already holds the new configuration', () => {
    useCartStore.getState().addItem(line);
    useCartStore.getState().addItem(half, 2);

    useCartStore.getState().replaceItem(half.id, line, 2);

    expect(ids()).toEqual([line.id]);
    expect(useCartStore.getState().quantityOf(line.id)).toBe(3);
  });

  it('sets the quantity when the configuration is unchanged', () => {
    useCartStore.getState().addItem(half, 2);
    useCartStore.getState().replaceItem(half.id, half, 4);
    expect(ids()).toEqual([half.id]);
    expect(useCartStore.getState().quantityOf(half.id)).toBe(4);
  });
});
