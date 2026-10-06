import { cartLineId } from '../src/components/pages/product-detail/hooks/use-dish-order';

const plain = { addOnIds: [], notes: '' };

describe('cartLineId', () => {
  it('a dish ordered as the quick ADD orders it keeps the bare dish id', () => {
    expect(cartLineId('tandoori-chicken', plain)).toBe('tandoori-chicken');
    expect(
      cartLineId('tandoori-chicken', {
        ...plain,
        portion: 'full',
        spice: 'medium',
      }),
    ).toBe('tandoori-chicken');
  });

  it('a half portion, another spice, an add-on or a note each make a new line', () => {
    const ids = [
      cartLineId('tandoori-chicken', { ...plain, portion: 'half' }),
      cartLineId('tandoori-chicken', { ...plain, spice: 'spicy' }),
      cartLineId('tandoori-chicken', { ...plain, addOnIds: ['add-cheese'] }),
      cartLineId('tandoori-chicken', { ...plain, notes: 'no onion' }),
    ];
    expect(new Set(ids).size).toBe(4);
    ids.forEach(id => expect(id).not.toBe('tandoori-chicken'));
  });

  it('ignores the order add-ons were ticked in', () => {
    expect(
      cartLineId('butter-chicken', {
        ...plain,
        addOnIds: ['extra-gravy', 'butter-naan'],
      }),
    ).toBe(
      cartLineId('butter-chicken', {
        ...plain,
        addOnIds: ['butter-naan', 'extra-gravy'],
      }),
    );
  });

  it('ignores whitespace around a note, and a note of only whitespace', () => {
    expect(
      cartLineId('butter-chicken', { ...plain, notes: '  less oil ' }),
    ).toBe(cartLineId('butter-chicken', { ...plain, notes: 'less oil' }));
    expect(cartLineId('butter-chicken', { ...plain, notes: '   ' })).toBe(
      'butter-chicken',
    );
  });
});
