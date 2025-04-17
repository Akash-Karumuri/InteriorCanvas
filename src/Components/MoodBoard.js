import React, { useState, useRef, useEffect } from 'react';
import './MoodBoard.css';

const MoodBoard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRetailer, setSelectedRetailer] = useState('All Retailers/Brands');
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSizeSelector, setShowSizeSelector] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 800 });
  const [cropMode, setCropMode] = useState(false);  
  const [savedBoards, setSavedBoards] = useState([]); 
  const [boardName, setBoardName] = useState('My Mood Board'); 
  
  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isPerformingUndoRedo = useRef(false);
  
  const canvasRef = useRef(null);
  const dragItemRef = useRef(null);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const cropStartRef = useRef(null); 
  const cropEndRef = useRef(null);
  
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

  // Save current state to history
  const saveToHistory = (newItems) => {
    if (isPerformingUndoRedo.current) return;
    
    // Create a deep copy of the items
    const itemsCopy = JSON.parse(JSON.stringify(newItems || canvasItems));
    
    // If we're in the middle of history, remove all future states
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Add the new state to history
    setHistory([...newHistory, itemsCopy]);
    setHistoryIndex(newHistory.length);
  };

  // Handle undo operation
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    isPerformingUndoRedo.current = true;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setCanvasItems(history[newIndex]);
    
    // Deselect item when undoing
    setSelectedItem(null);
    setCropMode(false);
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 0);
  };

  // Handle redo operation
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    isPerformingUndoRedo.current = true;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setCanvasItems(history[newIndex]);
    
    // Deselect item when redoing
    setSelectedItem(null);
    setCropMode(false);
    
    setTimeout(() => {
      isPerformingUndoRedo.current = false;
    }, 0);
  };
  
  // Initialize history with empty state
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory([]);
    }
  }, []);

  // Update selected item when canvas items change
  useEffect(() => {
    if (selectedItem) {
      const updatedItem = canvasItems.find(item => item.id === selectedItem.id);
      if (updatedItem) {
        setSelectedItem(updatedItem);
      } else {
        setSelectedItem(null);
      }
    }
  }, [canvasItems]);

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
      zIndex: canvasItems.length + 1,
      flipX: false,
      flipY: false, 
      cropParams: null 
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
      
      const newItems = [...canvasItems, newItem];
      setCanvasItems(newItems);
      saveToHistory(newItems);
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
    
    // If we're in crop mode, handle the crop operation
    if (cropMode && selectedItem && selectedItem.id === item.id) {
      return;
    }
    
    setSelectedItem(item);
    // Exit crop mode when selecting a different item
    setCropMode(false);
  };

  // Handle canvas click (deselect items)
  const handleCanvasClick = () => {
    setSelectedItem(null);
    // Exit crop mode when clicking canvas
    setCropMode(false);
  };

  // Handle item mouse down for dragging
  const handleMouseDown = (e, item) => {
    e.stopPropagation();
    
    // Check if we're in crop mode
    if (cropMode && selectedItem && selectedItem.id === item.id) {
      // Start crop operation
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cropStartRef.current = { x, y };
      
      // Add event listeners for mouse move and up during crop
      document.addEventListener('mousemove', handleCropMove);
      document.addEventListener('mouseup', handleCropEnd);
      return;
    }
    
    // Store the item and initial position for dragging
    dragItemRef.current = item;
    const { clientX, clientY } = e;
    dragStartPosRef.current = { x: clientX, y: clientY };
    
    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle crop move
  const handleCropMove = (e) => {
    if (!cropMode || !selectedItem || !cropStartRef.current) return;
    
    const rect = document.querySelector(`.canvas-item.selected`).getBoundingClientRect();
    const x = Math.max(0, Math.min(selectedItem.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(selectedItem.height, e.clientY - rect.top));
    
    cropEndRef.current = { x, y };
    
    // Update visual crop selection
    const cropSelection = document.querySelector('.crop-selection');
    if (cropSelection) {
      const left = Math.min(cropStartRef.current.x, cropEndRef.current.x);
      const top = Math.min(cropStartRef.current.y, cropEndRef.current.y);
      const width = Math.abs(cropEndRef.current.x - cropStartRef.current.x);
      const height = Math.abs(cropEndRef.current.y - cropStartRef.current.y);
      
      cropSelection.style.left = `${left}px`;
      cropSelection.style.top = `${top}px`;
      cropSelection.style.width = `${width}px`;
      cropSelection.style.height = `${height}px`;
      cropSelection.style.display = 'block';
    }
  };

  // Handle crop end
  const handleCropEnd = (e) => {
    if (!cropMode || !selectedItem || !cropStartRef.current || !cropEndRef.current) return;
    
    document.removeEventListener('mousemove', handleCropMove);
    document.removeEventListener('mouseup', handleCropEnd);
    
    // Calculate crop parameters as normalized values (0 to 1)
    const left = Math.min(cropStartRef.current.x, cropEndRef.current.x);
    const top = Math.min(cropStartRef.current.y, cropEndRef.current.y);
    const width = Math.abs(cropEndRef.current.x - cropStartRef.current.x);
    const height = Math.abs(cropEndRef.current.y - cropStartRef.current.y);
    
    // Don't apply crop if selection is too small
    if (width < 10 || height < 10) {
      cropStartRef.current = null;
      cropEndRef.current = null;
      return;
    }
    
    const cropParams = {
      x: left / selectedItem.width,
      y: top / selectedItem.height,
      width: width / selectedItem.width,
      height: height / selectedItem.height
    };
    
    // Apply the crop
    const newItems = canvasItems.map(item => 
      item.id === selectedItem.id
        ? { ...item, cropParams }
        : item
    );
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
    
    // Reset crop mode
    setCropMode(false);
    cropStartRef.current = null;
    cropEndRef.current = null;
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
    if (!dragItemRef.current) return;
    
    // Save state after drag completes
    saveToHistory(canvasItems);
    
    dragItemRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Bring item forward
  const handleBringForward = () => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.map(item => {
      // Find maximum z-index
      const maxZ = Math.max(...canvasItems.map(item => item.zIndex || 0));
      
      return item.id === selectedItem.id
        ? { ...item, zIndex: maxZ + 1 }
        : item;
    });
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  // Send item backward
  const handleSendBackward = () => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.map(item => {
      // Find minimum z-index
      const minZ = Math.min(...canvasItems.map(item => item.zIndex || 0));
      
      return item.id === selectedItem.id
        ? { ...item, zIndex: minZ - 1 }
        : item;
    });
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
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
    
    const newItems = [...canvasItems, newItem];
    setCanvasItems(newItems);
    setSelectedItem(newItem);
    saveToHistory(newItems);
  };

  // Delete item
  const handleDelete = () => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.filter(item => item.id !== selectedItem.id);
    setCanvasItems(newItems);
    setSelectedItem(null);
    saveToHistory(newItems);
  };

  // Handle scale/resize
  const handleScale = (factor) => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.map(item => 
      item.id === selectedItem.id
        ? { 
            ...item, 
            width: item.width * factor,
            height: item.height * factor
          }
        : item
    );
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  // Handle horizontal flip
  const handleFlipHorizontal = () => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.map(item => 
      item.id === selectedItem.id
        ? { ...item, flipX: !item.flipX }
        : item
    );
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  // Handle vertical flip
  const handleFlipVertical = () => {
    if (!selectedItem) return;
    
    const newItems = canvasItems.map(item => 
      item.id === selectedItem.id
        ? { ...item, flipY: !item.flipY }
        : item
    );
    
    setCanvasItems(newItems);
    saveToHistory(newItems);
  };

  // Toggle crop mode
  const handleToggleCrop = () => {
    if (!selectedItem) return;
    
    // Toggle crop mode
    setCropMode(prev => !prev);
    
    // Reset crop references when entering crop mode
    if (!cropMode) {
      cropStartRef.current = null;
      cropEndRef.current = null;
    }
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

  // Save the current board
  const handleSaveBoard = () => {
    const newBoard = {
      id: Date.now(),
      name: boardName,
      items: canvasItems,
      size: canvasSize
    };
    
    setSavedBoards(prev => [...prev, newBoard]);
    alert(`Board "${boardName}" saved successfully!`);
  };

  // Download the current board as an image
  const handleDownloadBoard = () => {
    if (!canvasRef.current || canvasItems.length === 0) {
      alert('No items to download!');
      return;
    }
    
    try {
      // Create a new canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Sort items by z-index
      const sortedItems = [...canvasItems].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      // Promise to wait for all images to load
      const loadPromises = sortedItems.map(item => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            // Apply transformations
            ctx.save();
            
            // Position
            ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
            
            // Apply flips
            if (item.flipX) ctx.scale(-1, 1);
            if (item.flipY) ctx.scale(1, -1);
            
            // Draw image
            if (item.cropParams) {
              // Draw cropped image
              const sx = item.cropParams.x * img.width;
              const sy = item.cropParams.y * img.height;
              const sWidth = item.cropParams.width * img.width;
              const sHeight = item.cropParams.height * img.height;
              
              ctx.drawImage(
                img, 
                sx, sy, sWidth, sHeight,
                -item.width / 2, -item.height / 2, item.width, item.height
              );
            } else {
              // Draw full image
              ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
            }
            
            ctx.restore();
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${item.img}`);
            resolve();
          };
          img.src = item.img;
        });
      });
      
      // When all images are loaded, convert canvas to image
      Promise.all(loadPromises).then(() => {
        const dataUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const link = document.createElement('a');
        link.download = `${boardName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = dataUrl;
        link.click();
      });
    } catch (err) {
      console.error('Error generating image', err);
      alert('Failed to download image. Please try again.');
    }
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
          <button className="header-btn py-5" onClick={handleDownloadBoard}>
            <i className="bi bi-download"></i> Download
          </button>
          <button className="header-btn" onClick={handleSaveBoard}>
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
          <div className="dropdown-filters">
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
              {/* Board name input */}
              <div className="board-name-container">
                <input
                  type="text"
                  className="board-name-input"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="Name your mood board"
                />
              </div>

              {canvasItems.length === 0 && (
                <div className="mood-board-placeholder">
                  <h2>CREATE A MOOD BOARD</h2>
                  <p>Start by dragging items on to your canvas.</p>
                </div>
              )}
              
              {canvasItems.map(item => (
                <div
                  key={item.id}
                  className={`canvas-item ${selectedItem && selectedItem.id === item.id ? 'selected' : ''} ${cropMode && selectedItem && selectedItem.id === item.id ? 'crop-mode' : ''}`}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    zIndex: item.zIndex || 1,
                    boxShadow: selectedItem && selectedItem.id === item.id 
                              ? cropMode ? '0 0 0 2px #ff6347' : '0 0 0 2px #3498db' 
                              : 'none',
                    cursor: cropMode && selectedItem && selectedItem.id === item.id ? 'crosshair' : 'move',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => handleCanvasItemClick(e, item)}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                >
                  <div 
                    className="item-content"
                    style={{
                      width: '100%',
                      height: '100%',
                      transform: `
                        ${item.flipX ? 'scaleX(-1)' : ''}
                        ${item.flipY ? 'scaleY(-1)' : ''}
                      `,
                      // Apply crop if available
                      clipPath: item.cropParams 
                        ? `inset(
                            ${item.cropParams.y * 100}% 
                            ${(1 - (item.cropParams.x + item.cropParams.width)) * 100}% 
                            ${(1 - (item.cropParams.y + item.cropParams.height)) * 100}% 
                            ${item.cropParams.x * 100}%
                          )`
                        : 'none'
                    }}
                  >
                    <img 
                      src={item.img} 
                      alt={item.alt} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  
                  {/* Crop selection overlay */}
                  {cropMode && selectedItem && selectedItem.id === item.id && (
                    <div 
                      className="crop-selection"
                      style={{
                        position: 'absolute',
                        display: 'none',
                        border: '2px dashed white',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        pointerEvents: 'none'
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editing Panel */}
        <div className="editing-panel">
          <div className="editing-header">Image Editing</div>
          <div className="editing-tools">
            {/* Undo/Redo tools */}
            <div className="undo-redo-tools">
              <div 
                className={`tool ${historyIndex <= 0 ? 'disabled' : ''}`}
                onClick={handleUndo}
              >
                <span className="tool-icon"><i className="bi bi-arrow-counterclockwise"></i></span>
                <span className="tool-name">Undo</span>
              </div>
              <div 
                className={`tool ${historyIndex >= history.length - 1 ? 'disabled' : ''}`}
                onClick={handleRedo}
              >
                <span className="tool-icon"><i className="bi bi-arrow-clockwise"></i></span>
                <span className="tool-name">Redo</span>
              </div>
            </div>
            
            <div className='fb-tool'>
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
            </div>
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleClone}
            >
              <span className="tool-icon"><i className="bi bi-copy"></i></span>
              <span className="tool-name">Duplicate</span>
            </div>
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleDelete}
            >
              <span className="tool-icon"><i className="bi bi-trash3"></i></span>
              <span className="tool-name">Delete</span>
            </div>
            
            {/* Flip horizontal tool */}
            <div className='flip-tool'>
              <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleFlipHorizontal}
            >
              <span className="tool-icon">↔</span>
              <span className="tool-name">Flip H</span>
            </div>
            
            {/* Flip vertical tool */}
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''}`}
              onClick={handleFlipVertical}
            >
              <span className="tool-icon">↕</span>
              <span className="tool-name">Flip V</span>
            </div>
            </div>
            
            {/* Crop tool */}
            <div 
              className={`tool ${!selectedItem ? 'disabled' : ''} ${cropMode ? 'active' : ''}`}
              onClick={handleToggleCrop}
            >
              <span className="tool-icon">◫</span>
              <span className="tool-name">Crop</span>
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