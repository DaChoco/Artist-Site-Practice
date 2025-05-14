import type { cartContextState } from "~/contexts/cart";

export default class UserCartService {
  private baseurl: string;
  private userID: string;
  constructor(baseurl: string, userID: string) {
    this.baseurl = baseurl;
    this.userID = userID;
  }

  async getCart(): Promise<cartContextState[]> {
    const response = await fetch(`${this.baseurl}/cart/${this.userID}`, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }

  async addToCart(itemID: string, title: string, price: number, url: string, quantity: number): Promise<cartContextState[]> {
    const dataBody = { 
      itemID: itemID, 
      url: url,
      title: title,
      createdAt: Date.now(),
      price: price
    };
    
    const response = await fetch(`${this.baseurl}/cart/${this.userID}/add?quantity=${quantity}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataBody),
    });
    const data = await response.json();
    return data;
  }

  async deleteFromCart(productID: string): Promise<cartContextState[]> {
    const response = await fetch(
      `${this.baseurl}/cart/${this.userID}/delete?=${encodeURIComponent(
        productID
      )}`,
      {
        method: "DELETE",
      }
    );
    return response.json();
  }

  async updateTheCart(
    productID: string,
    quantity: number
  ): Promise<cartContextState[]> {
    const response = await fetch(
      `${this.baseurl}/cart/${this.userID}/${productID}/update`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({quantity: quantity }),
      }
    );
    const data = await response.json();
    return data;
  }
}
