"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaShoppingCart, FaTrash, FaPlus } from "react-icons/fa";
import { inventoryAPI, scanAPI, orderAPI, productAPI, type Product, type CartItemDto } from "@/lib/api-service";

interface CartItem extends Product {
  qty: number;
}

const PRODUCT_EMOJIS: { [key: string]: string } = {
  'default': '📦',
};

export default function CashierDashboard() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [activeInput, setActiveInput] = useState<'barcode' | 'phone' | 'cash'>('barcode');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [phone, setPhone] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  
  // Fetch inventory on mount
  useEffect(() => {
    // Debug: Check if token exists
    const token = localStorage.getItem('token');
    console.log('🔑 Token exists:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'NONE');
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const inventoryData = await inventoryAPI.getAll();
      const productList = inventoryData.map((item: any) => item.product);
      setProducts(productList);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);
    
    if (!keyword.trim()) {
      loadInventory();
      setShowProducts(false);
      return;
    }

    try {
      setError('');
      const results = await productAPI.search(keyword);
      setProducts(results);
      setShowProducts(true);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    }
  };

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) return;
  
    try {
      setError('');
      const cartItem: CartItemDto = await scanAPI.scan(scannedBarcode);
      
      // For weighed items, we create a CartItem where qty = weight
      const newWeighedItem: CartItem = {
        id: cartItem.productId, // The ID from the database
        name: cartItem.productName,
        sellingPrice: cartItem.unitPrice, // Price per KG
        qty: cartItem.quantity,          // This is the Weight (e.g., 1.45)
        code: cartItem.productSku,
        markedPrice: cartItem.unitPrice,
        createdAt: '',
        type: 'WEIGHED'
      };
  
      // Weighed items are usually unique scan entries
      setCart((prev) => [...prev, newWeighedItem]);
      
      setBarcode('');
      setSuccess(`Added ${cartItem.productName} (${cartItem.quantity}kg)`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Scan failed');
      setTimeout(() => setError(''), 3000);
    }
  };
  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

  // Handle dial pad input
  function handleDialPadInput(value: string) {
    if (activeInput === 'barcode') {
      if (value === 'clear') {
        setBarcode('');
      } else if (value === 'enter') {
        handleScan(barcode);
      } else {
        setBarcode((prev) => prev + value);
      }
    } else if (activeInput === 'phone') {
      if (value === 'clear') {
        setPhone('');
      } else if (value === 'enter') {
        // Validate phone
      } else {
        setPhone((prev) => prev + value);
      }
    } else if (activeInput === 'cash') {
      if (value === 'clear') {
        setCashGiven('');
      } else if (value === 'enter') {
        // Process
      } else {
        setCashGiven((prev) => prev + value);
      }
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
    setSuccess(`Added ${product.name} to cart`);
    setTimeout(() => setSuccess(''), 2000);
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
      }).filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter(item => item.id !== id));
  }

  // Complete payment
  const completePayment = async () => {
    if (cart.length === 0) {
      setError('Cart is empty!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (paymentMethod === 'mpesa' && !phone) {
      setError('Please enter phone number');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (paymentMethod === 'cash' && (!cashGiven || Number(cashGiven) < total)) {
      setError('Insufficient cash amount');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const orderRequest = {
        orderItems: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
        })),
        paymentMethod: paymentMethod.toUpperCase(),
        phoneNumber: paymentMethod === 'mpesa' ? phone : undefined,
        amountPaid: paymentMethod === 'cash' ? Number(cashGiven) : total,
      };

      const order = await orderAPI.create(orderRequest);
      
      setSuccess(`Payment completed! Order #${order.id}`);
      
      // Clear cart and reset
      setCart([]);
      setPhone('');
      setCashGiven('');
      setBarcode('');
      setSearchTerm('');
      setShowProducts(false);
      
      // Refresh inventory
      await loadInventory();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Payment error:', err);
      
      // Check if it's an authentication error
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        setError('Authentication failed. Please login again.');
        // Optionally redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(err.message || 'Payment failed');
      }
      
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // or whatever key you use
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', height: '100vh', background: '#1a1a1a', overflow: 'hidden' }}>
      {/* Left: Cart Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', padding: '2rem 2rem 0 2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <FaShoppingCart style={{ color: '#10b981', fontSize: 28 }} />
    <span style={{
      fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
      fontWeight: 700,
      fontSize: 32,
      color: '#10b981',
      letterSpacing: 2,
    }}>
      ESIT GROCERIES
    </span>
  </div>

  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          padding: '10px 16px',
          borderRadius: 8,
          border: '1.5px solid #10b981',
          fontSize: 16,
          minWidth: 250,
          outline: 'none',
          background: '#2a2a2a',
          color: '#fff',
        }}
      />
      <FaSearch style={{ color: '#10b981', fontSize: 18 }} />
    </div>

    {/* --- NEW LOGOUT BUTTON --- */}
    <button 
      onClick={handleLogout}
      style={{
        padding: '10px 16px',
        background: 'transparent',
        border: '1.5px solid #ef4444',
        color: '#ef4444',
        borderRadius: 8,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#ef4444';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#ef4444';
      }}
    >
      Logout
    </button>
  </div>
</div>

        {/* Messages */}
        {error && (
          <div style={{ 
            background: '#7f1d1d', 
            color: '#fca5a5', 
            padding: '10px 16px', 
            borderRadius: 8, 
            marginBottom: 12,
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid #991b1b'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            background: '#064e3b', 
            color: '#6ee7b7', 
            padding: '10px 16px', 
            borderRadius: 8, 
            marginBottom: 12,
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid #059669'
          }}>
            {success}
          </div>
        )}

        {/* Product Search Results */}
        {showProducts && searchTerm && (
          <div style={{
            background: '#2a2a2a',
            borderRadius: 12,
            padding: '1rem',
            marginBottom: '1rem',
            border: '1px solid #374151',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <h4 style={{ 
                color: '#10b981', 
                fontSize: 16, 
                fontWeight: 700,
                margin: 0
              }}>
                Search Results ({products.length})
              </h4>
              <button
                onClick={() => {
                  setShowProducts(false);
                  setSearchTerm('');
                  loadInventory();
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #374151',
                  color: '#9ca3af',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {products.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  style={{
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: 8,
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{PRODUCT_EMOJIS['default']}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        color: '#fff', 
                        fontWeight: 700, 
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {product.name}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>
                        {product.code}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: 15 }}>
                      Ksh {product.sellingPrice.toFixed(2)}
                    </span>
                    <FaPlus style={{ color: '#10b981', fontSize: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div style={{ 
          flex: 1, 
          background: '#2a2a2a',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          padding: '2rem',
          border: '1px solid #374151',
          overflowY: 'auto',
          marginBottom: 140
        }}>
          <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            fontWeight: 800, 
            color: '#10b981', 
            fontSize: 22, 
            letterSpacing: 1.5,
            textAlign: 'center'
          }}>
            CART ITEMS
          </h3>
          
          <div style={{ borderBottom: '1px solid #374151', marginBottom: '1rem' }} />
          
          {loading && cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontWeight: 600 }}>
              Loading...
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem', fontWeight: 600 }}>
              No items in cart
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2.5fr 1fr 1.2fr 1.3fr 0.5fr',
                fontWeight: 700,
                color: '#10b981',
                fontSize: 14,
                padding: '0.5rem',
                borderBottom: '1px solid #374151',
                marginBottom: '0.5rem'
              }}>
                <span>Item</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>

              {/* Cart Items */}
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '2.5fr 1fr 1.2fr 1.3fr 0.5fr',
                  alignItems: 'center',
                  background: '#1f2937',
                  borderRadius: 10,
                  padding: '0.8rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #374151',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{PRODUCT_EMOJIS['default']}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{item.code}</div>
                    </div>
                  </div>
                  
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    Ksh {item.sellingPrice.toFixed(2)}
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button 
                      onClick={() => changeQty(item.id, -1)} 
                      style={{ 
                        background: '#374151', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '4px 10px', 
                        color: '#10b981', 
                        fontWeight: 700, 
                        cursor: 'pointer' 
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 30, textAlign: 'center', fontWeight: 700, color: '#fff' }}>
                      {item.qty}
                    </span>
                    <button 
                      onClick={() => changeQty(item.id, 1)} 
                      style={{ 
                        background: '#374151', 
                        border: 'none', 
                        borderRadius: 6, 
                        padding: '4px 10px', 
                        color: '#10b981', 
                        fontWeight: 700, 
                        cursor: 'pointer' 
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <span style={{ fontWeight: 700, color: '#10b981' }}>
                    Ksh {(item.sellingPrice * item.qty).toFixed(2)}
                  </span>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Total at Bottom */}
        <div style={{ 
          position: 'absolute', 
          left: 40, 
          bottom: 32, 
          right: 32,
          background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
          borderRadius: 16,
          padding: '1.5rem 2rem',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#d1fae5', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              Total Amount
            </div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>
              Ksh {total.toFixed(2)}
            </div>
          </div>
          <div style={{ color: '#d1fae5', fontSize: 14 }}>
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </div>

      {/* Right: Payment Section */}
      <div style={{ 
        width: 420, 
        background: '#2a2a2a',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
        padding: '2.5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #374151',
        overflowY: 'auto'
      }}>
        {/* Barcode Scanner */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 700, color: '#10b981', marginBottom: 8, fontSize: 16 }}>
            Scan Barcode
          </label>
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onFocus={() => setActiveInput('barcode')}
            onKeyPress={(e) => e.key === 'Enter' && handleScan(barcode)}
            placeholder="Scan or enter barcode"
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: 8, 
              border: '2px solid #10b981', 
              fontSize: 16,
              outline: 'none',
              background: '#1f2937',
              color: '#fff'
            }}
          />
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontWeight: 700, color: '#10b981', marginBottom: 12, fontSize: 18 }}>
            Payment Method
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => setPaymentMethod('mpesa')} 
              style={{ 
                flex: 1, 
                padding: '14px', 
                borderRadius: 8, 
                border: paymentMethod === 'mpesa' ? '2px solid #10b981' : '1px solid #374151',
                background: paymentMethod === 'mpesa' ? '#064e3b' : '#1f2937',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              M-Pesa
            </button>
            <button 
              onClick={() => setPaymentMethod('cash')} 
              style={{ 
                flex: 1, 
                padding: '14px', 
                borderRadius: 8, 
                border: paymentMethod === 'cash' ? '2px solid #10b981' : '1px solid #374151',
                background: paymentMethod === 'cash' ? '#064e3b' : '#1f2937',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              Cash
            </button>
          </div>
        </div>

        {paymentMethod === 'mpesa' ? (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#9ca3af' }}>
              Customer Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onFocus={() => setActiveInput('phone')}
              placeholder="0712345678"
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: 8, 
                border: '1px solid #374151', 
                fontSize: 16,
                outline: 'none',
                background: '#1f2937',
                color: '#fff'
              }}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, color: '#9ca3af' }}>
              Amount Received
            </label>
            <input
              type="number"
              value={cashGiven}
              onChange={e => setCashGiven(e.target.value)}
              onFocus={() => setActiveInput('cash')}
              placeholder="Enter amount"
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: 8, 
                border: '1px solid #374151', 
                fontSize: 16,
                outline: 'none',
                background: '#1f2937',
                color: '#fff'
              }}
            />
            {cashGiven && (
              <div style={{ 
                marginTop: 12, 
                padding: '12px', 
                background: '#064e3b', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                border: '1px solid #059669'
              }}>
                <span style={{ fontWeight: 600, color: '#6ee7b7' }}>Change:</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: 18 }}>
                  Ksh {(Number(cashGiven) - total > 0 ? (Number(cashGiven) - total).toFixed(2) : '0.00')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Dial Pad */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button 
                key={n} 
                onClick={() => handleDialPadInput(n.toString())}
                style={{ 
                  padding: '16px', 
                  fontSize: 20, 
                  fontWeight: 700,
                  borderRadius: 8, 
                  border: '1px solid #374151',
                  background: '#1f2937',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {n}
              </button>
            ))}
            <button 
              onClick={() => handleDialPadInput('clear')}
              style={{ 
                padding: '16px', 
                fontSize: 14, 
                fontWeight: 600,
                borderRadius: 8, 
                border: '1px solid #374151',
                background: '#374151',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            <button 
              onClick={() => handleDialPadInput('0')}
              style={{ 
                padding: '16px', 
                fontSize: 20, 
                fontWeight: 700,
                borderRadius: 8, 
                border: '1px solid #374151',
                background: '#1f2937',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              0
            </button>
            <button 
              onClick={() => handleDialPadInput('enter')}
              style={{ 
                padding: '16px', 
                fontSize: 14, 
                fontWeight: 700,
                borderRadius: 8, 
                border: 'none',
                background: '#10b981',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Enter
            </button>
          </div>
        </div>

        {/* Complete Payment Button */}
        <button 
          onClick={completePayment}
          disabled={loading || cart.length === 0}
          style={{ 
            width: '100%', 
            padding: '18px',
            background: loading || cart.length === 0 
              ? '#374151' 
              : 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 800,
            cursor: loading || cart.length === 0 ? 'not-allowed' : 'pointer',
            letterSpacing: 1,
            boxShadow: loading || cart.length === 0 ? 'none' : '0 4px 16px rgba(16,185,129,0.3)',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>
    </div>
  );
}