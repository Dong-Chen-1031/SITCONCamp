// AI 食譜生成器 - 積木系統
class RecipeGenerator {
    constructor() {
        this.blocks = [];
        this.blockIdCounter = 0;
        this.isDarkMode = false;
        
        this.init();
    }
    
    init() {
        // 確保在 DOM 完全載入後執行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }
    
    initializeComponents() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
        this.setupTooltips();
    }
    
    setupEventListeners() {
        // 積木模板點擊事件
        document.querySelectorAll('.block-template').forEach(template => {
            template.addEventListener('click', (e) => {
                const blockType = e.currentTarget.dataset.blockType;
                this.addBlock(blockType);
            });
        });
        
        // 生成食譜按鈕
        document.getElementById('generate-recipe').addEventListener('click', () => {
            this.generateRecipe();
        });
        
        // 清空工作區
        document.getElementById('clear-workspace').addEventListener('click', () => {
            this.clearWorkspace();
        });
        
        // 保存食譜
        document.getElementById('save-recipe').addEventListener('click', () => {
            this.saveRecipe();
        });
        
        // 材料助手
        document.getElementById('ingredient-helper').addEventListener('click', () => {
            this.showIngredientHelper();
        });
        
        // 積木預覽
        document.getElementById('preview-blocks').addEventListener('click', () => {
            this.showBlockPreview();
        });
        
        // 快捷鍵幫助
        document.getElementById('shortcuts-help').addEventListener('click', () => {
            this.showKeyboardShortcuts();
        });
        
        // 主題切換
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        } else {
            console.warn('Theme toggle button not found');
        }
    }
    
    setupTheme() {
        // 檢查本地存儲的主題設定
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.isDarkMode = savedTheme === 'dark';
        } else {
            // 檢查系統主題偏好
            this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        // 等待 DOM 完全載入後再應用主題
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyTheme();
            });
        } else {
            // DOM 已經載入，立即應用主題
            this.applyTheme();
        }
        
        // 監聽系統主題變化
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.isDarkMode = e.matches;
                this.applyTheme();
            }
        });
    }
    
    applyTheme() {
        const html = document.documentElement;
        const themeToggle = document.getElementById('theme-toggle');
        
        // 確保元素存在
        if (!html) {
            console.warn('HTML element not found');
            return;
        }
        
        if (this.isDarkMode) {
            html.classList.add('dark');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                    </svg>
                `;
            }
        } else {
            html.classList.remove('dark');
            if (themeToggle) {
                themeToggle.innerHTML = `
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                `;
            }
        }
        
        // 保存主題設定
        try {
            localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
    }
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        console.log('Theme toggled to:', this.isDarkMode ? 'dark' : 'light');
        this.applyTheme();
    }
    
    setupDragAndDrop() {
        // 增強的拖放系統
        const workspace = document.getElementById('workspace');
        const blocksContainer = document.getElementById('blocks-container');
        const toolbox = document.querySelector('.lg\\:col-span-1'); // 工具箱區域
        
        // 積木模板拖拉
        document.querySelectorAll('.block-template').forEach(template => {
            template.draggable = true;
            
            template.addEventListener('dragstart', (e) => {
                const blockType = e.currentTarget.dataset.blockType;
                e.dataTransfer.setData('text/plain', blockType);
                e.dataTransfer.effectAllowed = 'copy';
                template.classList.add('dragging');
            });
            
            template.addEventListener('dragend', (e) => {
                template.classList.remove('dragging');
            });
        });
        
        // 工作區拖放
        workspace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            workspace.classList.add('drag-over');
        });
        
        workspace.addEventListener('dragleave', (e) => {
            if (!workspace.contains(e.relatedTarget)) {
                workspace.classList.remove('drag-over');
            }
        });
        
        workspace.addEventListener('drop', (e) => {
            e.preventDefault();
            workspace.classList.remove('drag-over');
            
            const blockType = e.dataTransfer.getData('text/plain');
            const blockId = e.dataTransfer.getData('text/block-id');
            
            if (blockType && !blockId) {
                // 從工具箱拖拉新積木
                this.addBlock(blockType);
            }
        });
        
        // 工具箱拖放（刪除功能）
        if (toolbox) {
            toolbox.addEventListener('dragover', (e) => {
                const blockId = e.dataTransfer.getData('text/block-id');
                if (blockId) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    toolbox.classList.add('delete-zone');
                }
            });
            
            toolbox.addEventListener('dragleave', (e) => {
                if (!toolbox.contains(e.relatedTarget)) {
                    toolbox.classList.remove('delete-zone');
                }
            });
            
            toolbox.addEventListener('drop', (e) => {
                e.preventDefault();
                toolbox.classList.remove('delete-zone');
                
                // 檢查是否是從工作區拖拉過來的積木
                const draggedBlockId = e.dataTransfer.getData('text/block-id');
                if (draggedBlockId) {
                    this.removeBlock(draggedBlockId);
                    this.showSuccess('積木已刪除！');
                }
            });
        }
        
        // 使積木容器支持排序
        this.setupSortable();
    }
    
    setupSortable() {
        const blocksContainer = document.getElementById('blocks-container');
        let draggedElement = null;
        let draggedBlockId = null;
        
        // 為每個積木添加拖拉事件
        const addDragEvents = (element) => {
            element.draggable = true;
            
            element.addEventListener('dragstart', (e) => {
                draggedElement = element;
                draggedBlockId = element.id;
                element.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', element.outerHTML);
                // 設置積木ID，用於拖拉到工具箱刪除
                e.dataTransfer.setData('text/block-id', element.id);
            });
            
            element.addEventListener('dragend', (e) => {
                element.classList.remove('dragging');
                draggedElement = null;
                draggedBlockId = null;
                
                // 拖拉結束後更新順序
                this.updateBlockOrder();
            });
        };
        
        // 容器拖放事件
        blocksContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedElement) {
                const afterElement = this.getDragAfterElement(blocksContainer, e.clientY);
                if (afterElement == null) {
                    blocksContainer.appendChild(draggedElement);
                } else {
                    blocksContainer.insertBefore(draggedElement, afterElement);
                }
            }
        });
        
        blocksContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            // 拖放完成後更新順序
            this.updateBlockOrder();
        });
        
        // 使用 MutationObserver 監聽新增的積木
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList.contains('block-item')) {
                            addDragEvents(node);
                        }
                    });
                }
            });
        });
        
        observer.observe(blocksContainer, { childList: true });
    }
    
    updateBlockOrder() {
        // 重新排列內部數據以匹配 DOM 順序
        const blockElements = document.querySelectorAll('.block-item');
        const newBlocksOrder = [];
        
        blockElements.forEach((element, index) => {
            const blockId = element.id;
            const blockData = this.blocks.find(block => block.id === blockId);
            
            if (blockData) {
                newBlocksOrder.push(blockData);
            }
        });
        
        // 更新內部數據順序
        this.blocks = newBlocksOrder;
        
        // 更新步驟編號和連接線
        this.updateStepNumbers();
        this.updateConnectors();
    }
    
    updateConnectors() {
        const blockElements = document.querySelectorAll('.block-item');
        
        blockElements.forEach((element, index) => {
            // 移除現有的連接線
            const existingConnector = element.querySelector('.block-connector');
            if (existingConnector) {
                existingConnector.remove();
            }
            
            // 為非第一個積木添加連接線
            if (index > 0) {
                const connector = document.createElement('div');
                connector.className = 'block-connector absolute -top-4 left-2 w-0.5 h-8 bg-blue-400';
                element.appendChild(connector);
            }
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.block-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    addBlock(blockType) {
        const blockId = `block_${this.blockIdCounter++}`;
        const container = document.getElementById('blocks-container');
        
        // 克隆模板
        const template = document.querySelector(`#block-templates .${blockType}-block`);
        const blockElement = template.cloneNode(true);
        
        // 設置 ID 和事件
        blockElement.id = blockId;
        blockElement.classList.add('block-item');
        
        // 添加步驟編號
        const stepNumber = document.createElement('div');
        stepNumber.className = 'step-number absolute -left-8 top-4 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold';
        stepNumber.textContent = this.blocks.length + 1;
        blockElement.style.position = 'relative';
        blockElement.appendChild(stepNumber);
        
        // 添加連接線（除了第一個積木）
        if (this.blocks.length > 0) {
            const connector = document.createElement('div');
            connector.className = 'block-connector absolute -top-4 left-2 w-0.5 h-8 bg-blue-400';
            blockElement.appendChild(connector);
        }
        
        // 添加刪除事件
        const removeBtn = blockElement.querySelector('.remove-block');
        removeBtn.addEventListener('click', () => {
            this.removeBlock(blockId);
        });
        
        // 添加觸控長按刪除（行動裝置友好）
        let touchTimer = null;
        
        blockElement.addEventListener('touchstart', (e) => {
            touchTimer = setTimeout(() => {
                if (confirm('確定要刪除這個積木嗎？')) {
                    this.removeBlock(blockId);
                }
            }, 1000); // 長按 1 秒
        });
        
        blockElement.addEventListener('touchend', (e) => {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });
        
        blockElement.addEventListener('touchmove', (e) => {
            if (touchTimer) {
                clearTimeout(touchTimer);
                touchTimer = null;
            }
        });
        
        // 添加輸入事件監聽
        const inputs = blockElement.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateBlockData(blockId);
            });
            
            // 添加 focus 高亮效果
            input.addEventListener('focus', () => {
                blockElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                blockElement.classList.remove('focused');
            });
        });
        
        // 添加折疊/展開功能
        const header = blockElement.querySelector('.flex.items-center.justify-between');
        const content = blockElement.querySelector('.space-y-2');
        
        if (header && content) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'collapse-toggle text-gray-400 hover:text-gray-600 ml-2';
            toggleBtn.innerHTML = '▼';
            toggleBtn.addEventListener('click', () => {
                this.toggleBlock(blockId);
            });
            
            header.insertBefore(toggleBtn, header.lastChild);
        }
        
        // 添加到工作區
        container.appendChild(blockElement);
        
        // 添加動畫效果
        blockElement.style.opacity = '0';
        blockElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            blockElement.style.transition = 'all 0.3s ease';
            blockElement.style.opacity = '1';
            blockElement.style.transform = 'translateY(0)';
        }, 10);
        
        // 更新內部數據
        this.blocks.push({
            id: blockId,
            type: blockType,
            data: {},
            collapsed: false
        });
        
        // 隱藏空狀態
        this.toggleEmptyState();
        
        // 更新所有步驟編號和連接線
        this.updateStepNumbers();
        this.updateConnectors();
        
        // 自動聚焦到第一個輸入框
        const firstInput = blockElement.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 350);
        }
    }
    
    toggleBlock(blockId) {
        const blockElement = document.getElementById(blockId);
        const blockData = this.blocks.find(block => block.id === blockId);
        const content = blockElement.querySelector('.space-y-2');
        const toggleBtn = blockElement.querySelector('.collapse-toggle');
        
        if (blockData.collapsed) {
            // 展開
            content.style.display = 'block';
            toggleBtn.innerHTML = '▼';
            blockData.collapsed = false;
        } else {
            // 折疊
            content.style.display = 'none';
            toggleBtn.innerHTML = '▶';
            blockData.collapsed = true;
        }
    }
    
    updateStepNumbers() {
        const blockElements = document.querySelectorAll('.block-item');
        blockElements.forEach((element, index) => {
            const stepNumber = element.querySelector('.step-number');
            if (stepNumber) {
                stepNumber.textContent = index + 1;
            }
        });
    }
    
    removeBlock(blockId) {
        const blockElement = document.getElementById(blockId);
        if (blockElement) {
            blockElement.style.transition = 'all 0.3s ease';
            blockElement.style.opacity = '0';
            blockElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                blockElement.remove();
                this.blocks = this.blocks.filter(block => block.id !== blockId);
                this.toggleEmptyState();
                this.updateStepNumbers();
                this.updateConnectors();
            }, 300);
        }
    }
    
    updateBlockData(blockId) {
        const blockElement = document.getElementById(blockId);
        const blockData = this.blocks.find(block => block.id === blockId);
        
        if (blockElement && blockData) {
            switch (blockData.type) {
                case 'structured':
                    blockData.data = {
                        action: blockElement.querySelector('.action-input').value,
                        ingredient: blockElement.querySelector('.ingredient-input').value,
                        time: blockElement.querySelector('.time-input').value
                    };
                    break;
                case 'ingredient':
                    blockData.data = {
                        ingredient: blockElement.querySelector('.ingredient-input').value,
                        amount: blockElement.querySelector('.amount-input').value
                    };
                    break;
                case 'freeform':
                    blockData.data = {
                        description: blockElement.querySelector('.description-input').value
                    };
                    break;
            }
        }
    }
    
    toggleEmptyState() {
        const workspace = document.getElementById('workspace');
        const emptyState = workspace.querySelector('.absolute.inset-0');
        const body = document.body;
        
        if (this.blocks.length > 0) {
            emptyState.style.display = 'none';
            body.classList.add('has-blocks');
        } else {
            emptyState.style.display = 'flex';
            body.classList.remove('has-blocks');
        }
    }
    
    clearWorkspace(confirm = true) {
        if (this.blocks.length === 0) return;
        
        if (confirm && !window.confirm('確定要清空所有積木嗎？')) {
            return;
        }
        
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';
        this.blocks = [];
        this.toggleEmptyState();
        this.hideRecipeResult();
    }
    
    async generateRecipe() {
        if (this.blocks.length === 0) {
            this.showError('請先添加一些積木來描述你的創意料理！');
            return;
        }
        
        // 更新所有積木數據
        this.blocks.forEach(block => {
            this.updateBlockData(block.id);
        });
        
        // 檢查是否有空的積木
        const hasEmptyBlocks = this.blocks.some(block => {
            const data = block.data;
            switch (block.type) {
                case 'structured':
                    return !data.action || !data.ingredient;
                case 'ingredient':
                    return !data.ingredient;
                case 'freeform':
                    return !data.description;
                default:
                    return false;
            }
        });
        
        if (hasEmptyBlocks) {
            this.showError('請填寫所有積木的必要欄位！');
            return;
        }
        
        // 顯示載入狀態
        this.showLoading();
        
        try {
            // 準備 API 請求數據
            const requestData = {
                blocks: this.blocks.map(block => {
                    if (block.type === 'freeform') {
                        return { description: block.data.description };
                    } else {
                        return block.data;
                    }
                }),
                style: document.getElementById('recipe-style').value
            };
            
            // 發送 API 請求
            const response = await fetch('/api/generate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.displayRecipe(result.recipe);
                this.showSuccess('食譜生成成功！');
            } else {
                this.showError(result.error || '生成食譜時發生錯誤');
            }
            
        } catch (error) {
            this.showError('網路連接錯誤，請檢查您的網路連接');
            console.error('Recipe generation error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    displayRecipe(recipe) {
        const resultSection = document.getElementById('recipe-result');
        const contentDiv = document.getElementById('recipe-content');
        
        contentDiv.innerHTML = `
            <div class="space-y-6">
                <!-- Recipe Header -->
                <div class="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${recipe.name}</h2>
                    <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${recipe.cooking_time}
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            ${recipe.servings}
                        </span>
                        <span class="flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            ${recipe.difficulty}
                        </span>
                    </div>
                </div>
                
                <!-- Ingredients -->
                <div class="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        材料清單
                    </h3>
                    <ul class="space-y-2">
                        ${recipe.ingredients.map(ingredient => `
                            <li class="flex items-center text-blue-800 dark:text-blue-200">
                                <svg class="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                ${ingredient}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                
                <!-- Steps -->
                <div class="bg-green-50 dark:bg-green-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                        </svg>
                        製作步驟
                    </h3>
                    <ol class="space-y-3">
                        ${recipe.steps.map((step, index) => `
                            <li class="flex items-start text-green-800 dark:text-green-200">
                                <span class="bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                                    ${index + 1}
                                </span>
                                <span>${step}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>
                
                <!-- Tips -->
                ${recipe.tips ? `
                    <div class="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-yellow-900 dark:text-yellow-100 mb-4 flex items-center">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                            </svg>
                            小貼士
                        </h3>
                        <p class="text-yellow-800 dark:text-yellow-200">${recipe.tips}</p>
                    </div>
                ` : ''}
                
                <!-- Actions -->
                <div class="flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button onclick="recipeGenerator.validateRecipe()" class="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors duration-200">
                        🔍 安全評估
                    </button>
                    <button onclick="recipeGenerator.shareRecipe()" class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200">
                        📤 分享食譜
                    </button>
                    <button onclick="recipeGenerator.downloadRecipe()" class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200">
                        📥 下載食譜
                    </button>
                </div>
            </div>
        `;
        
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    hideRecipeResult() {
        document.getElementById('recipe-result').classList.add('hidden');
    }
    
    async validateRecipe() {
        const recipeContent = document.getElementById('recipe-content').textContent;
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/validate-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipe: recipeContent })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.displayValidation(result.validation);
            } else {
                this.showError(result.error || '驗證食譜時發生錯誤');
            }
            
        } catch (error) {
            this.showError('網路連接錯誤');
            console.error('Recipe validation error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    displayValidation(validation) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 max-h-96 overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔍 食譜安全評估</h3>
                
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-600">${validation.safety_score}/10</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">安全性</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-600">${validation.feasibility_score}/10</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">可行性</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-purple-600">${validation.nutrition_score}/10</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">營養性</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-600">${validation.death_risk}</div>
                            <div class="text-sm text-gray-600 dark:text-gray-400">死亡風險</div>
                        </div>
                    </div>
                    
                    ${validation.warnings && validation.warnings.length > 0 ? `
                        <div class="bg-red-50 dark:bg-red-900 rounded-lg p-4">
                            <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">⚠️ 警告</h4>
                            <ul class="text-sm text-red-700 dark:text-red-300 space-y-1">
                                ${validation.warnings.map(warning => `<li>• ${warning}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${validation.suggestions && validation.suggestions.length > 0 ? `
                        <div class="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                            <h4 class="font-medium text-green-800 dark:text-green-200 mb-2">💡 建議</h4>
                            <ul class="text-sm text-green-700 dark:text-green-300 space-y-1">
                                ${validation.suggestions.map(suggestion => `<li>• ${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-6 text-center">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
                        關閉
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    saveRecipe() {
        const blocks = this.blocks;
        const recipeData = {
            blocks: blocks,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(recipeData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `recipe-blocks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('積木配置已保存！');
    }
    
    shareRecipe() {
        const recipeTitle = document.querySelector('#recipe-content h2')?.textContent || 'AI 生成的創意食譜';
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: recipeTitle,
                text: '看看我用 AI 創作的創意食譜！',
                url: url
            });
        } else {
            // 複製到剪貼板
            navigator.clipboard.writeText(url).then(() => {
                this.showSuccess('食譜連結已複製到剪貼板！');
            });
        }
    }
    
    downloadRecipe() {
        const recipeContent = document.getElementById('recipe-content').innerHTML;
        const title = document.querySelector('#recipe-content h2')?.textContent || 'AI 食譜';
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-50 p-8">
                <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
                    ${recipeContent}
                </div>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('食譜已下載！');
    }
    
    showLoading() {
        document.getElementById('loading-overlay').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading-overlay').classList.add('hidden');
    }
    
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${colors[type]}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 顯示動畫
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);
        
        // 自動隱藏
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    showIngredientHelper() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 w-full max-h-96 overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🥘 我有什麼材料</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            輸入你現有的材料 (用逗號分隔)
                        </label>
                        <textarea id="available-ingredients" 
                                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                  rows="3" 
                                  placeholder="例如：雞蛋, 洋蔥, 番茄, 起司, 麵包"></textarea>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">
                            取消
                        </button>
                        <button onclick="recipeGenerator.getIngredientSuggestions()" 
                                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors">
                            🔍 獲取建議
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // 聚焦到輸入框
        setTimeout(() => {
            document.getElementById('available-ingredients').focus();
        }, 100);
    }
    
    async getIngredientSuggestions() {
        const ingredientsText = document.getElementById('available-ingredients').value.trim();
        
        if (!ingredientsText) {
            this.showError('請輸入一些材料！');
            return;
        }
        
        const ingredients = ingredientsText.split(',').map(item => item.trim()).filter(item => item);
        
        if (ingredients.length === 0) {
            this.showError('請輸入有效的材料！');
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch('/api/suggest-ingredients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients })
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.displayIngredientSuggestions(result.suggestions);
                // 關閉材料輸入彈窗
                document.querySelector('.fixed.inset-0').remove();
            } else {
                this.showError(result.error || '獲取建議時發生錯誤');
            }
            
        } catch (error) {
            this.showError('網路連接錯誤');
            console.error('Ingredient suggestions error:', error);
        } finally {
            this.hideLoading();
        }
    }
    
    displayIngredientSuggestions(suggestions) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 w-full max-h-96 overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">🎯 AI 建議食譜</h3>
                
                <div class="space-y-4">
                    ${suggestions.map((suggestion, index) => `
                        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center justify-between mb-2">
                                <h4 class="font-medium text-gray-900 dark:text-white">${suggestion.name}</h4>
                                <span class="text-sm text-gray-500 dark:text-gray-400">${suggestion.time}</span>
                            </div>
                            
                            ${suggestion.additional_ingredients && suggestion.additional_ingredients.length > 0 ? `
                                <div class="mb-2">
                                    <span class="text-sm text-red-600 dark:text-red-400">需要額外購買：</span>
                                    <span class="text-sm text-gray-700 dark:text-gray-300">${suggestion.additional_ingredients.join(', ')}</span>
                                </div>
                            ` : ''}
                            
                            <div class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                ${suggestion.steps.join(' → ')}
                            </div>
                            
                            <button onclick="recipeGenerator.useIngredientSuggestion(${index})" 
                                    class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                                🚀 使用這個建議
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 text-center">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        關閉
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 存儲建議以供使用
        this.currentSuggestions = suggestions;
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    useIngredientSuggestion(index) {
        const suggestion = this.currentSuggestions[index];
        
        if (!suggestion) return;
        
        // 清空現有積木
        this.clearWorkspace(false);
        
        // 根據建議創建積木
        suggestion.steps.forEach(step => {
            setTimeout(() => {
                const blockId = this.addBlock('freeform');
                // 等待積木創建完成後填入內容
                setTimeout(() => {
                    const blockElement = document.getElementById(`block_${this.blockIdCounter - 1}`);
                    const textarea = blockElement.querySelector('.description-input');
                    if (textarea) {
                        textarea.value = step;
                        this.updateBlockData(`block_${this.blockIdCounter - 1}`);
                    }
                }, 100);
            }, 50);
        });
        
        // 關閉彈窗
        document.querySelector('.fixed.inset-0').remove();
        
        this.showSuccess(`已載入「${suggestion.name}」的建議步驟！`);
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 生成食譜
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.generateRecipe();
            }
            
            // Ctrl/Cmd + D: 添加自由積木
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.addBlock('freeform');
            }
            
            // Ctrl/Cmd + A: 添加動作積木
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                this.addBlock('structured');
            }
            
            // Ctrl/Cmd + I: 添加材料積木
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                this.addBlock('ingredient');
            }
            
            // Ctrl/Cmd + K: 清空工作區
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.clearWorkspace();
            }
            
            // Ctrl/Cmd + H: 材料助手
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.showIngredientHelper();
            }
            
            // Escape: 關閉彈窗
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.fixed.inset-0');
                modals.forEach(modal => modal.remove());
            }
            
            // ? 或 /: 顯示快捷鍵幫助
            if (e.key === '?' || e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }
    
    setupTooltips() {
        // 為按鈕添加工具提示
        const tooltips = {
            'generate-recipe': '生成食譜 (Ctrl+Enter)',
            'clear-workspace': '清空工作區 (Ctrl+K)',
            'save-recipe': '保存食譜配置',
            'ingredient-helper': '材料助手 (Ctrl+H)',
            'theme-toggle': '切換深/淺色主題'
        };
        
        Object.entries(tooltips).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.title = text;
                element.setAttribute('data-tooltip', text);
            }
        });
        
        // 為積木模板添加工具提示
        document.querySelectorAll('.block-template').forEach(template => {
            const blockType = template.dataset.blockType;
            let tooltip = '';
            
            switch (blockType) {
                case 'structured':
                    tooltip = '動作積木：結構化的動作+材料+時間 (Ctrl+A)';
                    break;
                case 'ingredient':
                    tooltip = '材料積木：材料名稱+份量 (Ctrl+I)';
                    break;
                case 'freeform':
                    tooltip = '自由積木：完全自由的描述 (Ctrl+D)';
                    break;
            }
            
            template.title = tooltip;
            template.setAttribute('data-tooltip', tooltip);
        });
    }
    
    showBlockPreview() {
        if (this.blocks.length === 0) {
            this.showError('沒有積木可以預覽！');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-4 w-full max-h-96 overflow-y-auto">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 積木預覽</h3>
                
                <div class="space-y-3">
                    ${this.blocks.map((block, index) => {
                        this.updateBlockData(block.id);
                        const data = block.data;
                        
                        let content = '';
                        switch (block.type) {
                            case 'structured':
                                content = `<span class="text-blue-600 dark:text-blue-400">${data.action || '（未填寫動作）'}</span> 
                                          <span class="text-green-600 dark:text-green-400">${data.ingredient || '（未填寫材料）'}</span>
                                          ${data.time ? `<span class="text-purple-600 dark:text-purple-400">${data.time}</span>` : ''}`;
                                break;
                            case 'ingredient':
                                content = `<span class="text-green-600 dark:text-green-400">${data.ingredient || '（未填寫材料）'}</span>
                                          ${data.amount ? `<span class="text-gray-600 dark:text-gray-400">${data.amount}</span>` : ''}`;
                                break;
                            case 'freeform':
                                content = `<span class="text-purple-600 dark:text-purple-400">${data.description || '（未填寫描述）'}</span>`;
                                break;
                        }
                        
                        return `
                            <div class="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    ${index + 1}
                                </div>
                                <div class="flex-1">
                                    ${content}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="mt-6 flex justify-center space-x-4">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        關閉
                    </button>
                    <button onclick="recipeGenerator.generateRecipe(); this.parentElement.parentElement.parentElement.remove();" 
                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        🚀 直接生成食譜
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    showKeyboardShortcuts() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4 w-full">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">⌨️ 鍵盤快捷鍵</h3>
                
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">生成食譜</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Enter</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">添加動作積木</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">添加材料積木</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+I</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">添加自由積木</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+D</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">材料助手</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+H</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">清空工作區</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600 dark:text-gray-400">關閉彈窗</span>
                        <kbd class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
                    </div>
                </div>
                
                <div class="mt-6 text-center">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        知道了
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 點擊外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}

// 初始化
const recipeGenerator = new RecipeGenerator();

// 全局函數
window.recipeGenerator = recipeGenerator;
