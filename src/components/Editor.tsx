import { useState } from 'react';

type EditorProps = {
    grid: number[][];
    palette: string[];
    nowColorID: number;
    setNowColorID: (id: number) => void;
    UpdataPaletteID: (id: number, newColor: string) => void;
    addColor: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    gridSize: { row: number, col: number }; 
    resizeGrid: (newSize: { row: number, col: number }) => void;
    backgroundImage: string | null;
    bgOpacity: number;
    setBgOpacity: (val: number) => void;
    penSize: number;
    setPenSize: (size: number) => void;
    paintCells: (i: number, j: number) => void;
    setLastPos: (pos: { i: number, j: number } | null) => void; 
    zoom: number;
    setZoom: (val: number) => void;
    handleRefreshConversion: () => void;
    clearGrid: () => void;
    bgOffset: { x: number, y: number };
    setBgOffset: (offset: { x: number, y: number }) => void;
};

export const Editor = ({ 
    grid, palette, nowColorID, setNowColorID, 
    UpdataPaletteID, addColor, handleImageUpload ,gridSize, resizeGrid,backgroundImage,
    bgOpacity, setBgOpacity, penSize, setPenSize, paintCells, setLastPos, zoom, setZoom,
    handleRefreshConversion, clearGrid, bgOffset, setBgOffset
}: EditorProps) => {
    const [inputSize, setInputSize] = useState(gridSize);
    const [isDrawing, setIsDrawing] = useState(false);

    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false); // 手のひらツール中か
    const [mode, setMode] = useState<'pen' | 'hand' | 'draft'>('pen'); // ツールモード

    // 描画終了時の処理
    const stopDrawing = () => {
        setIsDrawing(false);
        setIsPanning(false);
        setLastPos(null);
    };
    // マウス移動時の処理
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            if (mode === 'hand') {
                setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
            } else if (mode === 'draft') {
                // ★ 下書きだけの移動をここで処理
                setBgOffset({ x: bgOffset.x + e.movementX, y: bgOffset.y + e.movementY });
            }
        }
    };

    // ホイール操作で拡大縮小
    const handleWheel = (e: React.WheelEvent) => {
        // e.deltaY がマイナスなら上（奥）へ回転 ＝ 拡大
        // e.deltaY がプラスなら下（手前）へ回転 ＝ 縮小
        if (e.deltaY < 0) {
            setZoom(Math.min(zoom + 0.1, 3.0)); // 最大300%
        } else {
            setZoom(Math.max(zoom - 0.1, 0.5)); // 最小50%
        }
    };
    

    return (
        /* 全体*/
        <div onMouseUp={stopDrawing}
             onMouseLeave={stopDrawing}
             onMouseMove={handleMouseMove}
            style={{ 
                display: 'inline-flex', 
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '10px',
                margin: '0 auto',
                justifyContent: 'flex-start',
                width: '100%'
        }}>
            
            {/* 左側*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 1. Import & Refresh */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ cursor: 'pointer', padding: '8px 15px', border: '4px solid var(--border-color)', borderRadius: '100vh', backgroundColor: 'white', fontSize: '12px', fontWeight: 'bold' }}>
                        import<input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <button onClick={handleRefreshConversion} disabled={!backgroundImage} style={{ cursor: backgroundImage ? 'pointer' : 'not-allowed', width: '35px', height: '35px', border: '4px solid var(--border-color)', borderRadius: '50%', backgroundColor: 'white', opacity: backgroundImage ? 1 : 0.4 }}>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>

                {/* 2. SIZE設定 */}
                <div style={{ padding: '10px', border: '2px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>SIZE</div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="number" value={inputSize.col} onChange={(e) => setInputSize({...inputSize, col: Number(e.target.value)})} style={{ width: '40px' }} />
                        <input type="number" value={inputSize.row} onChange={(e) => setInputSize({...inputSize, row: Number(e.target.value)})} style={{ width: '40px' }} />
                        <button onClick={() => resizeGrid(inputSize)} style={{ fontSize: '10px', cursor: 'pointer' }}>リサイズ</button>
                    </div>
                </div>

                {/* 3. モード切り替え (ここが重要) */}
                <div style={{ display: 'flex', gap: '5px', padding: '10px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                    <button onClick={() => setMode('pen')} style={{ flex: 1, height: '30px', backgroundColor: mode === 'pen' ? 'var(--border-color)' : 'white', color: mode === 'pen' ? 'white' : 'black' }}><i className="bi bi-pencil-fill"></i></button>
                    <button onClick={() => setMode('hand')} style={{ flex: 1, height: '30px', backgroundColor: mode === 'hand' ? 'var(--border-color)' : 'white', color: mode === 'hand' ? 'white' : 'black' }}><i className="bi bi-hand-index-thumb-fill"></i></button>
                    {/* 下書き移動モードボタン */}
                    <button onClick={() => setMode(mode === 'draft' ? 'pen' : 'draft')} style={{ flex: 1, height: '30px', backgroundColor: mode === 'draft' ? 'var(--border-color)' : 'white', color: mode === 'draft' ? 'white' : 'black' }}>
                        <span className="glyphicon glyphicon-move"></span>
                    </button>
                </div>

                {/* 4. ZOOM & 下書き位置リセット */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', border: '2px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>ZOOM / RESET</div>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))} style={{ width: '30px', height: '30px', borderRadius: '50%' }}><i className="bi bi-zoom-out"></i></button>
                        <button onClick={() => setZoom(Math.min(zoom + 0.1, 3.0))} style={{ width: '30px', height: '30px', borderRadius: '50%' }}><i className="bi bi-zoom-in"></i></button>
                        <button onClick={() => { setOffset({x:0, y:0}); setZoom(1); }} style={{ width: '30px', height: '30px', borderRadius: '50%' }}><i className="bi bi-arrows-fullscreen"></i></button>
                    </div>
                    {/* 下書きの位置だけを初期化 */}
                    <button onClick={() => setBgOffset({x:0, y:0})} style={{ fontSize: '9px', marginTop: '5px', cursor: 'pointer' }}>下書き位置リセット</button>
                </div>

                {/* 5. 透明度設定 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>下書き透明度</div>
                    <input type="range" min="0" max="1" step="0.05" value={bgOpacity} onChange={(e) => setBgOpacity(Number(e.target.value))} style={{ accentColor: 'var(--border-color)' }} />
                </div>
            </div>

            {/* 中央：キャンパス */}
            <div onMouseDown={() => (mode === 'hand' || mode === 'draft') && setIsPanning(true)}
                 onWheel={handleWheel}
                 style={{
                    display: 'flex', flexDirection: 'column', width: '400px', height: '400px',
                    flexShrink: 0, alignItems: 'center', justifyContent: 'center', position: 'relative',
                    overflow: 'hidden', border: 'none',

                    cursor: mode === 'hand' ? (isPanning ? 'grabbing' : 'grab') : mode === 'draft' ? 'move' : 'crosshair'
                }}>
                {/* 実際のキャンバス（グリッドエリア） */}
                <div style={{
                    width: gridSize.col >= gridSize.row ? '100%' : 'auto',
                    height: gridSize.row > gridSize.col ? '100%' : 'auto',
                    aspectRatio: `${gridSize.col} / ${gridSize.row}`,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative', 
                    zIndex: 0, 
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    
                }}>
                    {/*下書き画像レイヤー */}
                    {backgroundImage && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundImage: `url(${backgroundImage})`, backgroundSize: 'contain',
                            backgroundPosition: 'bottom center', backgroundRepeat: 'no-repeat',
                            opacity: bgOpacity, zIndex: 1, pointerEvents: 'none',
                            transform: `translate(${bgOffset.x}px, ${bgOffset.y}px)`
                        }} />
                    )}

                    {/* グリッドの描画 */}
                    {grid.map((row, i) => (
                        <div key={i} style={{ display: 'flex', flex: 1 }}>
                            {row.map((colorID, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    onMouseDown={() => {
                                        if (mode === 'pen') {
                                            setIsDrawing(true);
                                            paintCells(i, j);
                                        }
                                    }}
                                    onMouseEnter={() => {
                                        // ★修正3: 閉じカッコ } を追加して文法エラーを解消
                                        if (isDrawing && mode === 'pen') {
                                            paintCells(i, j);
                                        }
                                    }}
                                    style={{
                                        flex: 1, width: '100%', height: '100%',
                                        border: '0.5px solid rgba(0, 0, 0, 0.15)',
                                        backgroundColor: palette[colorID] === '#FFFFFF' && backgroundImage 
                                            ? 'rgba(255, 255, 255, 0.2)' 
                                            : palette[colorID],
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* 右側：パレット */}
            <div style={{ 
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                alignSelf: 'flex-start',
                marginLeft: '7px',
                gap: '15px'
            }}>
                {/* ペンサイズ選択 */}
                <div style={{ 
                    display: 'flex', gap: '5px', padding: '10px', 
                    border: '4px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#f4f1e8' ,
                    paddingBottom: '10px',
                    justifyContent: 'center', 
                    marginBottom: '10px'
                }}>
                    {[1, 2, 3].map(size => (
                        <button
                            key={size}
                            onClick={() => setPenSize(size)}
                            style={{
                                width: '30px', height: '30px', cursor: 'pointer',
                                backgroundColor: penSize === size ? 'var(--border-color)' : 'white',
                                color: penSize === size ? 'white' : 'black',
                                border: '1px solid #ccc', borderRadius: '4px',
                                fontFamily: 'DotFont',
                                fontSize: `${6 + (size * 4)}px`,

                            }}
                        >
                            ●
                        </button>
                    ))}
                    {/*全消しボタン */}
                    <div style={{ width: '1px', backgroundColor: '#ccc', margin: '0 5px' }} /> {/* 区切り線 */}
                    <button
                        onClick={clearGrid}
                        style={{
                            width: '30px', height: '30px', cursor: 'pointer',
                            backgroundColor: 'white', color: '#d9534f', // 少し赤みを持たせて警告色に
                            border: '1px solid #ccc', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="すべてリセット"
                    ><i className="bi bi-trash3-fill"></i>
                    </button>
                </div>
                {/* カラーパレットリスト */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '130px',
                    border: '4px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: '#f4f1e8',
                    maxHeight: '300px', 
                    overflowY: 'auto',
                    paddingTop: '20px',
                    paddingBottom: '20px'
                }}>
                    {palette.map((color, id) => (
                        <div key={id} style={{ margin: '8px', display: 'flex' }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => UpdataPaletteID(id, e.target.value)}
                                style={{ width: '30px', height: '30px', cursor: 'pointer', flexShrink: 0 }}
                            />
                            <button
                                onClick={() => setNowColorID(id)}
                                style={{
                                    fontFamily: 'monospace', 
                                    fontSize: '12px', 
                                    marginLeft: '5px', 
                                    border: 'none', 
                                    background: nowColorID === id ? 'var(--dot-color)' : '#fff',
                                    flexGrow: 1,
                                    padding: '5px',
                                    width: '100px',
                                }}
                            >
                                {color.toUpperCase()}
                            </button>
                        </div>
                    ))} 
                </div>
                
                {/* ＋ボタン */}
                <button 
                    onClick={addColor} 
                    style={{ 
                        color: 'var(--border-color)',
                        fontFamily: 'DotFont',
                        position: 'absolute', 
                        right: '-10px', 
                        bottom: '-10px', 
                        width: '50px', 
                        height: '35px', 
                        borderRadius: '20px', 
                        border: '4px solid var(--border-color)', 
                        backgroundColor: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
};