"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const PRODUCTS = [
  { id: 1, name: 'Red Apple', price: 1.50, unit: 'per lb', emoji: '🍎', category: 'Fruits' },
  { id: 2, name: 'Banana', price: 0.80, unit: 'per bunch', emoji: '🍌', category: 'Fruits' },
  { id: 3, name: 'Broccoli', price: 2.20, unit: 'per head', emoji: '🥦', category: 'Vegetables' },
  { id: 4, name: 'Fresh Milk', price: 3.50, unit: '1 Gallon', emoji: '🥛', category: 'Dairy' },
  { id: 5, name: 'Cheddar', price: 5.00, unit: '200g', emoji: '🧀', category: 'Dairy' },
  { id: 6, name: 'Sourdough', price: 4.00, unit: 'Loaf', emoji: '🍞', category: 'Bakery' },
  { id: 7, name: 'Steak', price: 12.99, unit: 'per lb', emoji: '🥩', category: 'Meat' },
  { id: 8, name: 'Carrot', price: 1.20, unit: 'per bag', emoji: '🥕', category: 'Vegetables' },
  { id: 9, name: 'Avocado', price: 1.80, unit: 'each', emoji: '🥑', category: 'Fruits' },
  { id: 10, name: 'Orange Juice', price: 4.50, unit: '1 Bottle', emoji: '🧃', category: 'Beverages' },
  { id: 11, name: 'Croissant', price: 2.50, unit: 'each', emoji: '🥐', category: 'Bakery' },
  { id: 12, name: 'Eggs', price: 3.20, unit: 'Dozen', emoji: '🥚', category: 'Dairy' },
];

const CATEGORIES = [
  'All Items',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Meat',
  'Beverages',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}


export default function CashierDashboard() {
  const [category, setCategory] = useState('All Items');
  const [cart, setCart] = useState<any[]>([]);
  const [barcode, setBarcode] = useState('');
  const [activeInput, setActiveInput] = useState<'barcode' | 'phone' | 'cash'>('barcode');
  const [showContent, setShowContent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [phone, setPhone] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const cashierName = 'Jane Doe';
  const date = new Date().toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Add total variable
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Add handleDialPadInput function
  function handleDialPadInput(value: string) {
    if (activeInput === 'barcode') {
      if (value === 'clear') {
        setBarcode('');
      } else if (value === 'enter') {
        // Optionally, add barcode to cart here
      } else {
        setBarcode((prev) => prev + value);
      }
    } else if (activeInput === 'phone') {
      if (value === 'clear') {
        setPhone('');
      } else if (value === 'enter') {
        // Optionally, process phone number
      } else {
        setPhone((prev) => prev + value);
      }
    } else if (activeInput === 'cash') {
      if (value === 'clear') {
        setCashGiven('');
      } else if (value === 'enter') {
        // Optionally, process cash given
      } else {
        setCashGiven((prev) => prev + value);
      }
    }
  }

  function addToCart(product: any) {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
  }

  function changeQty(id: number, change: number) {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + change;
          if (newQty <= 0) return null;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  }

  // ...existing code...

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', background: '#f0fdf4', overflow: 'hidden' }}>
      {/* Left: Cart and Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', padding: '2.5rem 0 0 0' }}>
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
          <span style={{
            fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 34,
            color: '#059669',
            letterSpacing: 2,
            textShadow: '0 2px 0 #bbf7d0',
            padding: '0.5rem 0',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 2px 8px #bbf7d0',
            minWidth: 320,
            textAlign: 'center',
            lineHeight: 1.1
          }}>
            Prime Groceries
          </span>
        </div>
        {/* Cart Section */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 0, paddingBottom: 160, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{
            height: '100%',
            minHeight: 420,
            width: '100%',
            background: 'linear-gradient(120deg, #f0fdf4 0%, #fff 100%)',
            borderRadius: 24,
            boxShadow: '0 4px 24px #bbf7d0',
            padding: '2.2rem 2.5rem 2.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            border: '1.5px solid #bbf7d0',
            flex: 1,
            justifyContent: 'flex-start',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 180px)',
          }}>
            <div className="cart-header-html" style={{ textAlign: 'center', marginBottom: 0 }}>
              <h3 style={{ margin: 0, fontWeight: 800, color: '#059669', fontSize: 22, letterSpacing: 1.5, textShadow: '0 1px 0 #bbf7d0' }}>ITEMS</h3>
            </div>
            <div style={{ width: '100%', height: 1, background: '#bbf7d0', margin: '12px 0 10px 0', borderRadius: 2 }} />
            <div className="cart-items-html" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 30, fontWeight: 600, fontSize: 16 }}>No items scanned</div>
              ) : (
                <>
                  {/* Header Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.5fr',
                    fontWeight: 700,
                    color: '#059669',
                    fontSize: 15,
                    padding: '0 0.2rem 0.2rem 0.2rem',
                    borderBottom: '1.5px solid #bbf7d0',
                    marginBottom: 4,
                  }}>
                    <span>Item</span>
                    <span>Unit Price</span>
                    <span>Quantity</span>
                    <span>Total</span>
                  </div>
                  {cart.map(item => (
                    <div className="cart-item-html" key={item.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.5fr',
                      alignItems: 'center',
                      background: 'linear-gradient(90deg, #e0f7ef 0%, #f0fdf4 100%)',
                      borderRadius: 10,
                      padding: '0.5rem 0.7rem',
                      boxShadow: '0 2px 8px #e0f2fe',
                      fontSize: 15,
                      gap: 4,
                    }}>
                      {/* Item name with emoji */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{item.emoji}</span>
                        <span style={{ fontWeight: 700, color: '#059669' }}>{item.name}</span>
                      </div>
                      {/* Unit price */}
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Ksh {item.price.toFixed(2)}</span>
                      {/* Quantity (number or with unit) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button className="qty-btn-html" onClick={() => changeQty(item.id, -1)} style={{ background: '#e0f2fe', border: 'none', borderRadius: 6, padding: '2px 8px', color: '#059669', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px #bbf7d0' }}>-</button>
                        <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 700 }}>
                          {item.qty} {item.unit ? <span style={{ fontWeight: 400, color: '#6ee7b7' }}>{item.unit}</span> : ''}
                        </span>
                        <button className="qty-btn-html" onClick={() => changeQty(item.id, 1)} style={{ background: '#e0f2fe', border: 'none', borderRadius: 6, padding: '2px 8px', color: '#059669', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 2px #bbf7d0' }}>+</button>
                      </div>
                      {/* Total price for this row */}
                      <span style={{ fontWeight: 700, color: '#065f46' }}>Ksh {(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
        {/* Total Summary at Bottom Left */}
        <div style={{ position: 'absolute', left: 32, bottom: 32, zIndex: 10, boxShadow: '0 4px 16px rgba(22,163,74,0.08)', background: '#fff', borderRadius: 16, padding: 16, minWidth: 220 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#059669', fontWeight: 700, fontSize: 16, marginBottom: 2, letterSpacing: 1 }}>Total Price:</div>
            <div style={{ color: '#16a34a', fontWeight: 800, fontSize: 22 }}>Ksh {total.toFixed(2)}</div>
          </div>
        </div>
      </div>
      {/* Right: Payment Section */}
      <div style={{ width: 420, background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px 0 rgba(22,163,74,0.10)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '2.5rem 2.5rem 2.5rem 1.5rem', minHeight: '100vh', borderTopLeftRadius: 36, borderBottomLeftRadius: 36, border: '1.5px solid #bbf7d0', backdropFilter: 'blur(2px)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div>
            {/* Payment method and inputs */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#16a34a', marginBottom: 12 }}>Payment Method</div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button type="button" onClick={() => setPaymentMethod('mpesa')} style={{ flex: 1, padding: 12, borderRadius: 8, border: paymentMethod === 'mpesa' ? '2px solid #16a34a' : '1px solid #e5e7eb', background: paymentMethod === 'mpesa' ? '#dcfce7' : '#fff', color: '#14532d', fontWeight: 600, cursor: 'pointer' }}>M-Pesa</button>
                <button type="button" onClick={() => setPaymentMethod('cash')} style={{ flex: 1, padding: 12, borderRadius: 8, border: paymentMethod === 'cash' ? '2px solid #16a34a' : '1px solid #e5e7eb', background: paymentMethod === 'cash' ? '#dcfce7' : '#fff', color: '#14532d', fontWeight: 600, cursor: 'pointer' }}>Cash</button>
              </div>
            </div>
            {paymentMethod === 'mpesa' ? (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Customer Phone Number</div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onFocus={() => setActiveInput('phone')}
                  placeholder="e.g. 07XXXXXXXX"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #16a34a', fontSize: 16 }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Amount Received</div>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={e => setCashGiven(e.target.value)}
                  onFocus={() => setActiveInput('cash')}
                  placeholder="Enter amount given"
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #16a34a', fontSize: 16 }}
                />
                <div style={{ marginTop: 8, color: '#16a34a', fontWeight: 600, fontSize: 16 }}>
                  Change: {cashGiven && !isNaN(Number(cashGiven)) ? `Ksh ${(Number(cashGiven) - total > 0 ? (Number(cashGiven) - total).toFixed(2) : '0.00')}` : 'Ksh 0.00'}
                </div>
              </div>
            )}
          </div>
          {/* Dial pad above Complete Payment button */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              {activeInput === 'barcode' && (
                <input
                  type="text"
                  value={barcode}
                  readOnly
                  style={{ fontSize: 20, padding: '8px 16px', borderRadius: 8, border: '1px solid #16a34a', width: 180, textAlign: 'center' }}
                />
              )}
              {activeInput === 'phone' && (
                <input
                  type="text"
                  value={phone}
                  readOnly
                  style={{ fontSize: 20, padding: '8px 16px', borderRadius: 8, border: '1px solid #16a34a', width: 180, textAlign: 'center' }}
                />
              )}
              {activeInput === 'cash' && (
                <input
                  type="text"
                  value={cashGiven}
                  readOnly
                  style={{ fontSize: 20, padding: '8px 16px', borderRadius: 8, border: '1px solid #16a34a', width: 180, textAlign: 'center' }}
                />
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 50px)', gap: 8, justifyContent: 'center' }}>
              {[1,2,3,4,5,6,7,8,9].map(n => (
                <button key={n} type="button" style={{ fontSize: 20, padding: '12px 0', borderRadius: 8, border: '1px solid #16a34a', background: '#fff', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDialPadInput(n.toString())}>{n}</button>
              ))}
              <button type="button" style={{ fontSize: 18, padding: '12px 0', borderRadius: 8, border: '1px solid #bdbdbd', background: '#f3f4f6', color: '#bdbdbd', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDialPadInput('clear')}>Clear</button>
              <button type="button" style={{ fontSize: 20, padding: '12px 0', borderRadius: 8, border: '1px solid #16a34a', background: '#fff', color: '#16a34a', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDialPadInput('0')}>0</button>
              <button type="button" style={{ fontSize: 18, padding: '12px 0', borderRadius: 8, border: '1px solid #16a34a', background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }} onClick={() => handleDialPadInput('enter')}>Enter</button>
            </div>
          </div>
          <button style={{ width: '100%', background: 'linear-gradient(90deg, #059669 0%, #16a34a 100%)', color: '#fff', border: 'none', padding: 20, borderRadius: 14, fontSize: 20, fontWeight: 800, cursor: 'pointer', marginTop: 0, boxShadow: '0 2px 8px #bbf7d0', letterSpacing: 1.2, transition: 'background 0.2s' }} onClick={() => alert('Payment completed!')}>Complete Payment</button>
        </div>
      </div>
    </div>
  );
}
}
