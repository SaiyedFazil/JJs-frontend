import { useState } from 'react';
import type {
  DishDetail,
  MenuItem,
  PortionSize,
  SpiceLevel,
} from '@/types/menu.types';
import { priceOf } from '@/data/menu';
import { DEFAULT_SPICE } from '@/data/dish-details';
import { useCartStore, type CartLine } from '@/store/cart.store';

/** The choices that make two orders of one dish two different cart lines. */
export interface DishChoice {
  /** Absent for an unportioned dish. */
  portion?: PortionSize;
  /** Absent when the dish takes no spice level. */
  spice?: SpiceLevel;
  addOnIds: string[];
  notes: string;
}

/**
 * The cart line a configured dish lands on.
 *
 * Ordered exactly as a list's quick ADD orders it — full portion, the house
 * spice, nothing extra — it keeps the bare dish id, so it stacks with an ADD
 * from the menu or home screen instead of appearing as a second line. Any
 * other choice gets a line of its own; the kitchen cooks "no onion" as a
 * different plate.
 */
export const cartLineId = (dishId: string, choice: DishChoice): string => {
  const parts = [
    choice.portion === 'half' ? 'half' : '',
    choice.spice && choice.spice !== DEFAULT_SPICE ? choice.spice : '',
    [...choice.addOnIds].sort().join('+'),
    choice.notes.trim(),
  ];
  return parts.some(Boolean) ? [dishId, ...parts].join('|') : dishId;
};

/**
 * The product detail screen's order: what is being configured, what it costs,
 * and whether that exact configuration is already in the cart.
 *
 * One `quantity` drives both steppers on the screen. Before the dish is added
 * it is a draft; once this configuration is in the cart it IS the cart line's
 * quantity, so the two cannot disagree. Change any choice after adding and
 * the configuration no longer matches the line — the screen offers to add it
 * again rather than silently editing what is already in the cart.
 */
export const useDishOrder = (item: MenuItem, detail: DishDetail) => {
  const [portion, setPortion] = useState<PortionSize>('full');
  const [spice, setSpice] = useState<SpiceLevel>(DEFAULT_SPICE);
  const [addOnIds, setAddOnIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [draftQuantity, setDraftQuantity] = useState(1);

  const addItem = useCartStore(s => s.addItem);
  const decrementItem = useCartStore(s => s.decrementItem);

  const choice: DishChoice = {
    portion: item.portion ? portion : undefined,
    spice: detail.hasSpiceLevel ? spice : undefined,
    addOnIds,
    notes: detail.takesNotes ? notes : '',
  };
  const lineId = cartLineId(item.id, choice);
  const inCart = useCartStore(s => s.quantityOf(lineId));
  const isInCart = inCart > 0;

  const addOns = detail.addOns.filter(a => addOnIds.includes(a.id));
  /** One plate, add-ons included. */
  const unitPrice =
    priceOf(item, portion) + addOns.reduce((n, a) => n + a.price, 0);
  const quantity = isInCart ? inCart : draftQuantity;

  const line: CartLine = {
    id: lineId,
    name: item.name,
    price: unitPrice,
    dishId: item.id,
    options: {
      portion: choice.portion,
      spice: choice.spice,
      addOns,
      notes: choice.notes.trim() || undefined,
    },
  };

  const toggleAddOn = (id: string) =>
    setAddOnIds(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id],
    );

  const increment = () =>
    isInCart ? addItem(line) : setDraftQuantity(q => q + 1);

  /** A draft stops at one; a cart line at one is removed, as on every list. */
  const decrement = () =>
    isInCart
      ? decrementItem(lineId)
      : setDraftQuantity(q => Math.max(1, q - 1));

  const addToCart = () => {
    addItem(line, draftQuantity);
    // So a line later stepped back out of the cart returns to a fresh draft.
    setDraftQuantity(1);
  };

  return {
    portion,
    setPortion,
    spice,
    setSpice,
    addOnIds,
    toggleAddOn,
    notes,
    setNotes,
    unitPrice,
    quantity,
    total: unitPrice * quantity,
    isInCart,
    canDecrement: isInCart || quantity > 1,
    increment,
    decrement,
    addToCart,
  };
};
