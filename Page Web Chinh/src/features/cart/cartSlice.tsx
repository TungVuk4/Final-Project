import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartState = {
  productsInCart: ProductInCart[];
  subtotal: number;
};

const getCartFromLocalStorage = (): CartState => {
  const cart = localStorage.getItem("fashionCart");
  return cart ? JSON.parse(cart) : { productsInCart: [], subtotal: 0 };
};

const initialState: CartState = getCartFromLocalStorage();

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addProductToTheCart: (state, action: PayloadAction<ProductInCart>) => {
      const product = state.productsInCart.find(
        (product) => product.id === action.payload.id
      );
      if (product) {
        state.productsInCart = state.productsInCart.map((product) => {
          if (product.id === action.payload.id) {
            return {
              ...product,
              quantity: product.quantity + action.payload.quantity,
            };
          }
          return product;
        });
      } else {
        state.productsInCart.push(action.payload);
      }
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    removeProductFromTheCart: (
      state,
      action: PayloadAction<{ id: string }>
    ) => {
      state.productsInCart = state.productsInCart.filter(
        (product) => product.id !== action.payload.id
      );
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    setCartItems: (state, action: PayloadAction<ProductInCart[]>) => {
      state.productsInCart = action.payload;
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    updateProductQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      state.productsInCart = state.productsInCart.map((product) => {
        if (product.id === action.payload.id) {
          return {
            ...product,
            quantity: action.payload.quantity,
          };
        }
        return product;
      });
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    calculateTotalPrice: (state) => {
      state.subtotal = state.productsInCart.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
      localStorage.setItem("fashionCart", JSON.stringify(state));
    },
    clearCart: (state) => {
      state.productsInCart = [];
      state.subtotal = 0;
      localStorage.removeItem("fashionCart");
    },
  },
});

export const {
  addProductToTheCart,
  removeProductFromTheCart,
  setCartItems,
  updateProductQuantity,
  calculateTotalPrice,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
