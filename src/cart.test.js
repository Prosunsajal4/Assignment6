import { expect, test } from 'vitest';
import { cart } from './src/cart.js';

test('cart should initialize empty', () => {
  expect(cart.getItems()).toEqual([]);
  expect(cart.getTotalPrice()).toBe(0);
});

test('cart should add items correctly', () => {
  const plant = { id: 1, name: 'Oak Tree', price: 50 };
  cart.addItem(plant);

  expect(cart.getItems()).toHaveLength(1);
  expect(cart.getTotalPrice()).toBe(50);
});

test('cart should remove items correctly', () => {
  cart.removeItem(0);
  expect(cart.getItems()).toHaveLength(0);
  expect(cart.getTotalPrice()).toBe(0);
});
