const db: Record<string, any[]> = {
  products: [
    { id: '1', name: 'SRE Engineering T-Shirt', price: 25.99, category: 'Apparel', stock_quantity: 100, sku: 'SRE-TSHIRT', description: 'Comfortable t-shirt for on-call.' },
    { id: '2', name: 'Mechanical Keyboard (Tactile)', price: 120.00, category: 'Electronics', stock_quantity: 15, sku: 'KEY-TACT', description: 'Clicky switch mechanical keyboard.' },
    { id: '3', name: 'Coffee Mug - "It works on my machine"', price: 15.00, category: 'Accessories', stock_quantity: 50, sku: 'MUG-IWM', description: 'Standard 12oz ceramic mug.' },
    { id: '4', name: 'Noise Cancelling Headphones', price: 250.00, category: 'Electronics', stock_quantity: 10, sku: 'HP-NC', description: 'Essential for deep work.' }
  ],
  orders: [],
  order_items: [],
  users: [],
  payments: []
};

class MockQueryBuilder {
  private queryData: any[];

  constructor(private table: string, private method: 'select' | 'insert' | 'update' | 'delete', private payload?: any) {
    this.queryData = [];
    if (!db[this.table]) {
      db[this.table] = [];
    }

    if (method === 'select') {
      this.queryData = [...db[this.table]];
    } else if (method === 'insert') {
      const items = Array.isArray(payload) ? payload : [payload];
      const inserted = items.map(item => {
        const newItem = { id: Math.random().toString(36).substring(2, 15), created_at: new Date().toISOString(), ...item };
        db[this.table].push(newItem);
        return newItem;
      });
      this.queryData = inserted;
    }
  }

  select(columns?: string) {
    return this;
  }

  eq(column: string, value: any) {
    if (this.method === 'select') {
      this.queryData = this.queryData.filter(r => r[column] === value);
    } else if (this.method === 'update' || this.method === 'delete') {
      const targetIndices = db[this.table]
        .map((r, i) => (r[column] === value ? i : -1))
        .filter(i => i !== -1);
      
      if (this.method === 'update') {
        const updatedItems: any[] = [];
        targetIndices.forEach(idx => {
          db[this.table][idx] = { ...db[this.table][idx], ...this.payload };
          updatedItems.push(db[this.table][idx]);
        });
        this.queryData = updatedItems;
      } else if (this.method === 'delete') {
        const toDeleteIndices = new Set(targetIndices);
        db[this.table] = db[this.table].filter((_, i) => !toDeleteIndices.has(i));
        this.queryData = [];
      }
    }
    return this;
  }

  or(condition: string) {
    return this;
  }

  range(from: number, to: number) {
    if (this.method === 'select') {
      this.queryData = this.queryData.slice(from, to + 1);
    }
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    if (this.method === 'select') {
      this.queryData.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];
        if (valA < valB) return options?.ascending !== false ? -1 : 1;
        if (valA > valB) return options?.ascending !== false ? 1 : -1;
        return 0;
      });
    }
    return this;
  }

  async single() {
    return { data: this.queryData[0], error: this.queryData.length === 0 ? new Error('No rows found') : null };
  }

  async maybeSingle() {
    return { data: this.queryData[0] || null, error: null };
  }

  limit(count: number) {
    if (this.method === 'select') {
      this.queryData = this.queryData.slice(0, count);
    }
    return this;
  }

  then(resolve: any, reject: any) {
    resolve({ data: this.queryData, count: this.queryData.length, error: null });
  }
}

export function getMockSupabaseClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => new MockQueryBuilder(table, 'select'),
      insert: (data: any) => new MockQueryBuilder(table, 'insert', data).select(),
      update: (data: any) => new MockQueryBuilder(table, 'update', data),
      delete: () => new MockQueryBuilder(table, 'delete')
    }),
    rpc: async (fn: string, params?: any) => {
      return { data: [{ exists: true }], error: null };
    },
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: db.users }, error: null }),
        createUser: async (user: any) => {
          const newUser = { id: Math.random().toString(36).substring(2, 15), ...user };
          db.users.push(newUser);
          return { data: { user: newUser }, error: null };
        }
      }
    }
  };
}
