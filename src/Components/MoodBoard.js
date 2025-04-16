import React, { useState, useRef, useEffect } from 'react';
import './MoodBoard.css';

const MoodBoard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRetailer, setSelectedRetailer] = useState('All Retailers/Brands');
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSizeSelector, setShowSizeSelector] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const canvasRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  
  // Sample product images
  const products = [
    { id: 1, img: 'https://stylesourcebook.com.au/_ipx/w_300,f_webp/https://stylesourcebook-images.s3-ap-southeast-2.amazonaws.com/5242326/conversions/7288363-thumb.jpg', alt: 'Beige tile' },
    { id: 2, img: 'https://www.thedesignlibrary.co.nz/cdn/shop/files/IMG_3292_compact.webp?v=1700526092', alt: 'White ceramic bowl' },
    { id: 3, img: 'https://res.cloudinary.com/dmndjbrsi/image/upload/,dpr_2.0,f_auto,h_110,q_auto,w_110/v1/media/catalog/product/b/l/blaire_accent_chair_-_muse_rust_1_.jpg?_i=AB', alt: 'Wooden slats' },
    { id: 4, img: 'https://stylesourcebook.com.au/_ipx/w_300,f_webp/https://stylesourcebook-images.s3-ap-southeast-2.amazonaws.com/5624911/conversions/7448947-thumb.jpg', alt: 'Hexagon tiles' },
    { id: 5, img: 'https://stylesourcebook.com.au/_ipx/w_300,f_webp/https://stylesourcebook-images.s3-ap-southeast-2.amazonaws.com/5730424/conversions/7459772-thumb.jpg', alt: 'Round wooden table' },
    { id: 6, img: 'https://urbanroad.com/cdn/shop/files/UR2634_S_RP.jpg?v=1740210690', alt: 'Small bench' },
    { id: 7, img: 'https://www.globewest.com.au/media/catalog/product/L/T/LTO-ATLAS-ORB-NOC-1_1_1.jpg?quality=80&fit=bounds&height=315&width=315&canvas=315:315', alt: 'Gray curtain' },
    { id: 8, img: 'https://www.visualcomfort.com/media/catalog/product/a/w/aw1211bbs_2.png?optimize=medium&fit=bounds&height=100&width=100&canvas=100:100', alt: 'Wooden dresser' },
    { id: 9, img: 'https://m.media-amazon.com/images/I/31Gt5ikFQhL.jpg', alt: 'Leather ottoman' },
    { id: 10, img: 'https://m.media-amazon.com/images/I/31NklfWt5wL._QL92_SH45_SS200_.jpg', alt: 'Mushroom lamp' },
    { id: 11, img: 'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcQQpwedID-w1ZamCe5vLWYlYugKCEvf8fXAF4SZYvY8sCtNpToj', alt: 'Beige cushion' },
    { id: 12, img: 'https://img.archiexpo.com/images_ae/photo-m2/49577-6677433.webp', alt: 'Wooden table' },
    { id: 13, img: 'https://stylesourcebook.com.au/_ipx/w_300,f_webp/https://stylesourcebook-images.s3-ap-southeast-2.amazonaws.com/5797549/conversions/7341502-thumb.jpg', alt: 'Marble texture' },
    { id: 14, img: 'https://i.pinimg.com/236x/e1/5c/4e/e15c4eca382082c302f7b238d2a9d20e.jpg', alt: 'Small side table' },
    { id: 15, img: 'https://www.globewest.com.au/media/catalog/product/S/O/SOF-VIT-ELIO2S-RIT-CPLOLNA-1_1_1.jpg?quality=80&fit=bounds&height=&width=&canvas=:', alt: 'Dark wooden headboard' },
  ];

  // Handle product drag start
  const handleDragStart = (e, product) => {
    const transferData = {
      id: Date.now(),
      productId: product.id,
      img: product.img,
      alt: product.alt,
      x: 0,
      y: 0,
      width: 150,
      height: 150,
      zIndex: canvasItems.length + 1
    };
    e.dataTransfer.setData('application/json', JSON.stringify(transferData));
  };

  // Handle canvas drop
  const handleDrop = (e) => {
    e.preventDefault();
    
    // Get drop position relative to canvas
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    
    // Get transferred item data
    try {
      const transferData = JSON.parse(e.dataTransfer.getData('application/json'));
      const newItem = {
        ...transferData,
        x: x - 75, // Center the item on drop position
        y: y - 75
      };
      
      setCanvasItems(prev => [...prev, newItem]);
    } catch (err) {
      console.error('Error adding item to canvas', err);
    }
  };

  // Allow drop on canvas
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle canvas item selection
  const handleCanvasItemClick = (e, item) => {
    e.stopPropagation();
    setSelectedItem(item);
  };

  // Handle canvas click (deselect items)
  const handleCanvasClick = () => {
    setSelectedItem(null);
  };

  // Handle item mouse down for dragging
  const handleMouseDown = (e, item) => {
    e.stopPropagation();
    
    // Store the item and initial position
    dragItemRef.current = item;
    const { clientX, clientY } = e;
    dragStartPosRef.current = { x: clientX, y: clientY };
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e) => {
    if (!dragItemRef.current) return;
    
    const { clientX, clientY } = e;
    const deltaX = clientX - dragStartPosRef.current.x;
    const deltaY = clientY - dragStartPosRef.current.y;
    
    // Update position of the dragged item
    setCanvasItems(items => 
      items.map(item => 
        item.id === dragItemRef.current.id
          ? { ...item, x: item.x + deltaX, y: item.y + deltaY }
          : item
      )
    );
    
    // Update the starting position for the next move
    dragStartPosRef.current = { x: clientX, y: clientY };
  };

  // Handle mouse up after dragging
  const handleMouseUp = () => {
    dragItemRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Bring item forward
  const handleBringForward = () => {
    if (!selectedItem) return;
    
    setCanvasItems(items => {
      // Find maximum z-index
      const maxZ = Math.max(...items.map(item => item.zIndex || 0));
      
      return items.map(item => 
        item.id === selectedItem.id
          ? { ...item, zIndex: maxZ + 1 }
          : item
      );
    });
  };

  // Send item backward
  const handleSendBackward = () => {
    if (!selectedItem) return;
    
    setCanvasItems(items => {
      // Find minimum z-index
      const minZ = Math.min(...items.map(item => item.zIndex || 0));
      
      return items.map(item => 
        item.id === selectedItem.id
          ? { ...item, zIndex: minZ - 1 }
          : item
      );
    });
  };

  // Clone item
  const handleClone = () => {
    if (!selectedItem) return;
    
    const newItem = {
      ...selectedItem,
      id: Date.now(),
      x: selectedItem.x + 20,
      y: selectedItem.y + 20,
      zIndex: Math.max(...canvasItems.map(item => item.zIndex || 0)) + 1
    };
    
    setCanvasItems(prev => [...prev, newItem]);
    setSelectedItem(newItem);
  };

  // Delete item
  const handleDelete = () => {
    if (!selectedItem) return;
    setCanvasItems(items => items.filter(item => item.id !== selectedItem.id));
    setSelectedItem(null);
  };

  // Handle scale/resize
  const handleScale = (factor) => {
    if (!selectedItem) return;
    
    setCanvasItems(items => 
      items.map(item => 
        item.id === selectedItem.id
          ? { 
              ...item, 
              width: item.width * factor,
              height: item.height * factor
            }
          : item
      )
    );
  };

  // Select canvas size
  const handleCanvasSizeSelect = (width, height) => {
    setCanvasSize({ width, height });
    setShowSizeSelector(false);
  };

  // Start with initial canvas setup
  const handleGetStarted = () => {
    setShowSizeSelector(false);
  };

  return (
    <div className="style-sourcebook">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <h1>STYLE</h1>
          <p className='m-0'>SOURCEBOOK</p>
        </div>
        <div className="header-actions">
          <button className="header-btn py-5">
            <i className="bi bi-download"></i> Download
          </button>
          <button className="header-btn">
            <i className="bi bi-floppy"></i> Save
          </button>
          <button className="header-btn">Sign Up</button>
          <button className="header-btn">Log In</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-item active">PRODUCTS</div>
          <div className="sidebar-item">
            PAINT &<br />FINISHES
          </div>
          <div className="sidebar-item">
            SAVED<br />PRODUCTS
          </div>
          <div className="sidebar-item">TEXT</div>
          <div className="sidebar-item">
            UPLOAD<br />IMAGES
          </div>
          <div className="sidebar-item">PINTEREST</div>
          <div className="sidebar-item">
            SAVED<br />IMAGES
          </div>
          <div className="sidebar-item">
            PRODUCT<br />TAGS
          </div>
        </div>

        {/* Products Panel */}
        <div className="products-panel">
          {/* Search and Filters */}
          <div className="search-filters">
            <div className="search-box">
              <input type="text" placeholder="Search by Keyword" />
              <button className="search-btn"><i className="bi bi-search"></i></button>
            </div>
            <div className="filter-buttons">
              <button className="filter-btn">$</button>
              <button className="filter-btn">🎨</button>
            </div>
          </div>

          {/* Dropdowns */}
          <div className="dropdown-filters mb-0 pb-0">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-dropdown"
            >
              <option>All Categories</option>
              <option>Bathroom</option>
              <option>Bedroom</option>
              <option>Building & Hardware</option>
              <option>Decor</option>
              <option>Outdoor</option>
              <option>Kitchen & Dining</option>
              <option>Lighting</option>
              <option>Living</option>
              <option>Study</option>
              <option>Finishes & Textiles</option>
            </select>

            <select 
              value={selectedRetailer}
              onChange={(e) => setSelectedRetailer(e.target.value)}
              className="filter-dropdown"
            >
              <option>All Retailers/Brands</option>
              <option>ABI Interiors</option>
              <option>ADP</option>
              <option>Alex Group Aus</option>
              <option>ambertiles.com.au</option>
              <option>Amuma Living</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="product-grid mt-0 pt-0">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="product-item flexcenter my-5"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, product)}
              >
                <img className='w-100 ' src={product.img} alt={product.alt} />
              </div>
            ))}
          </div>

          {/* Product List Footer */}
          <div className="product-list-footer">
            <div className="product-count">{canvasItems.length} Products</div>
            <div className="product-total">$0.00</div>
            <button className="view-list-btn">View product list</button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="canvas-area">
          {showSizeSelector ? (
            <div className="canvas-size-selector">
              <h2>Select Your Mood Board Canvas Size</h2>
              <div className="canvas-size-options">
                <div 
                  className="canvas-size-option"
                  onClick={() => handleCanvasSizeSelect(800, 800)}
                >
                  <div className="size-preview square"></div>
                  <div className="size-label">1:1</div>
                </div>
                <div 
                  className="canvas-size-option"
                  onClick={() => handleCanvasSizeSelect(1200, 800)}
                >
                  <div className="size-preview rectangle"></div>
                  <div className="size-label">4:3</div>
                </div>
              </div>
              <button className="get-started-btn" onClick={handleGetStarted}>
                Get Started
              </button>
            </div>
          ) : (
            <div 
              className="mood-board-canvas"
              ref={canvasRef}
              style={{ 
                width: canvasSize.width, 
                height: canvasSize.height,
                position: 'relative',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={handleCanvasClick}
            >
              {canvasItems.length === 0 && (
                <div className="mood-board-placeholder">
                  <h2>CREATE A MOOD BOARD</h2>
                  <p>Start by dragging items on to your canvas.</p>
                </div>
              )}
              
              {canvasItems.map(item => (
                <div
                  key={item.id}
                  className={`canvas-item ${selectedItem && selectedItem.id === item.id ? 'selected' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    zIndex: item.zIndex || 1,
                    boxShadow: selectedItem && selectedItem.id === item.id ? '0 0 0 2px #3498db' : 'none'
                  }}
                  onClick={(e) => handleCanvasItemClick(e, item)}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                >
                  <img 
                    src={item.img} 
                    alt={item.alt} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editing Panel */}
        <div className="editing-panel">
          <div className="editing-header">Image Editing</div>
          <div className="editing-tools">
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleBringForward}
            >
              <span className="tool-icon">↑</span>
              <span className="tool-name">Forward</span>
            </div>
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleSendBackward}
            >
              <span className="tool-icon">↓</span>
              <span className="tool-name">Backward</span>
            </div>
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleClone}
            >
              <span className="tool-icon">⟲</span>
              <span className="tool-name">Copy</span>
            </div>
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleDelete}
            >
              <span className="tool-icon">✕</span>
              <span className="tool-name">Delete</span>
            </div>
            <div className="scale-tools">
              <div 
                className={`tool ${!selectedItem ? 'disabled' : ''}`}
                onClick={() => handleScale(1.1)}
              >
                <span className="tool-icon">+</span>
                <span className="tool-name">Larger</span>
              </div>
              <div 
                className={`tool ${!selectedItem ? 'disabled' : ''}`}
                onClick={() => handleScale(0.9)}
              >
                <span className="tool-icon">-</span>
                <span className="tool-name">Smaller</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodBoard;