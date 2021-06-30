type Order = {
  id: string;
  expiresAt: string;
  ticket: {
    price: number;
    title: string;
  };
  status: string;
};

export default Order;
