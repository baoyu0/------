document.addEventListener('DOMContentLoaded', () => {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '<p>正在加载数据...</p>';

    fetch('1.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('CSV数据加载成功，长度:', data.length);
            console.log('CSV数据前100个字符:', data.substring(0, 100));
            
            try {
                parsedData = parseCSV(data);
                if (!parsedData || !Array.isArray(parsedData.data) || parsedData.data.length === 0) {
                    throw new Error('解析后的数据无效或为空');
                }
                currentData = parsedData.data;
                renderTable(currentData);
                setupEventListeners(); // 移动事件监听器设置到这里
            } catch (parseError) {
                console.error('CSV解析错误:', parseError);
                dataContainer.innerHTML = `<p>解析数据时出错: ${parseError.message}</p>`;
            }
        })
        .catch(error => {
            console.error('加载CSV文件时出错:', error);
            dataContainer.innerHTML = `<p>加载数据时出错: ${error.message}</p>`;
        });

    // 添加主题切换功能
    setupThemeToggle();

    // 检查模态框元素
    const modal = document.getElementById('modal');
    if (!modal) {
        console.error('Modal element not found in the DOM');
    } else {
        console.log('Modal element found in the DOM');
    }
});

function setupEventListeners() {
    const searchInput = document.getElementById('search');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = parsedData.data.filter(row => 
            row.some(cell => cell.toLowerCase().includes(searchTerm))
        );
        renderTable(filteredData);
        highlightSearchResults(searchTerm);
    });

    const sortSelect = document.getElementById('sort');
    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        if (sortBy) {
            currentData = sortData(currentData, sortBy);
            renderTable(currentData);
        }
    });
}

function setupThemeToggle() {
    const lightModeButton = document.getElementById('light-mode');
    const darkModeButton = document.getElementById('dark-mode');
    const systemModeButton = document.getElementById('system-mode');

    function setTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.querySelectorAll('.theme-button').forEach(btn => btn.classList.remove('active'));
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeButton.classList.add('active');
        } else if (theme === 'light') {
            document.body.classList.add('light-mode');
            lightModeButton.classList.add('active');
        } else {
            // 系统模式
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.add('light-mode');
            }
            systemModeButton.classList.add('active');
        }
        localStorage.setItem('theme', theme);
    }

    function applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'system';
        setTheme(savedTheme);
    }

    lightModeButton.addEventListener('click', () => setTheme('light'));
    darkModeButton.addEventListener('click', () => setTheme('dark'));
    systemModeButton.addEventListener('click', () => setTheme('system'));

    applyTheme();

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addListener(applyTheme);
}

let parsedData;
let currentData = [];

function parseCSV(csv) {
    console.log('开始解析CSV，数据类型:', typeof csv);
    console.log('CSV数据长度:', csv.length);
    
    if (!csv || typeof csv !== 'string' || csv.trim().length === 0) {
        throw new Error('CSV数据无效或为空');
    }
    
    const lines = csv.trim().split('\n');
    console.log('CSV行数:', lines.length);
    
    if (lines.length < 2) {
        throw new Error('CSV数据行数不足');
    }
    
    const headers = lines[0].split(',');
    console.log('表头:', headers);
    
    const data = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        if (values.length !== headers.length) {
            console.warn(`第${index + 2}行数据列数不匹配:`, values);
            return null;
        }
        return values;
    }).filter(row => row !== null);
    
    console.log('解析后的数据行数:', data.length);
    console.log('解析后的数据示例:', data.slice(0, 3));
    
    if (data.length === 0) {
        throw new Error('CSV 数据为空或格式不正确');
    }
    
    return { headers, data };
}

function getEmotionIcon(emotion) {
    const icons = {
        '生气': 'fa-angry',
        '伤心': 'fa-sad-tear',
        '恐惧': 'fa-flushed',
        '痛苦': 'fa-tired',
        '委屈': 'fa-frown',
        '遗憾': 'fa-meh',
        '内疚': 'fa-guilty',
        '自卑': 'fa-sad-cry',
        '焦虑': 'fa-anxious',
        '怨恨': 'fa-angry',
        '厌烦': 'fa-meh-rolling-eyes',
        '痛恨': 'fa-angry',
        '嫉妒': 'fa-jealous',
        '尴尬': 'fa-grimace',
        '回避': 'fa-meh-blank',
        '低落': 'fa-sad-tear',
        '泪哀': 'fa-sad-cry',
        '忧伤': 'fa-sad-tear',
        '不耐烦': 'fa-angry'
    };
    return icons[emotion] || 'fa-question';
}

function getEmotionColor(emotion) {
    const colors = {
        '生气': '#e74c3c',
        '伤心': '#3498db',
        '恐惧': '#9b59b6',
        '痛苦': '#e67e22',
        '委屈': '#f1c40f',
        '遗憾': '#1abc9c',
        '内疚': '#34495e',
        '自卑': '#7f8c8d',
        '焦虑': '#d35400',
        '怨恨': '#c0392b',
        '厌烦': '#16a085',
        '痛恨': '#8e44ad',
        '嫉妒': '#27ae60',
        '尴尬': '#f39c12',
        '回避': '#2c3e50',
        '低落': '#2980b9',
        '泪哀': '#1abc9c',
        '忧伤': '#3498db',
        '不耐烦': '#e74c3c'
    };
    return colors[emotion] || '#333';
}

function showModal(emotion, content) {
    console.log('showModal called with:', emotion, content);
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal.querySelector('.close');

    if (!modal || !modalTitle || !modalBody || !closeBtn) {
        console.error('Modal elements not found:', { modal, modalTitle, modalBody, closeBtn });
        return;
    }

    modalTitle.textContent = `${emotion} - 详情`;
    modalBody.innerHTML = `
        <div class="modal-emotion">
            <i class="fas ${getEmotionIcon(emotion)} modal-emotion-icon" style="color: ${getEmotionColor(emotion)};"></i>
            <div class="modal-emotion-text" style="color: ${getEmotionColor(emotion)};">${emotion}</div>
        </div>
        <div class="modal-description">${content ? content.replace(/\n/g, '<br>') : '暂无详细信息'}</div>
    `;

    modal.style.display = 'block';
    console.log('Modal should be visible now. Modal style:', modal.style.display);

    closeBtn.onclick = function() {
        modal.style.display = 'none';
        console.log('Modal closed by close button');
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            console.log('Modal closed by clicking outside');
        }
    }
}

function sortData(data, sortBy) {
    return [...data].sort((a, b) => {
        if (sortBy === 'emotion') return a[0].localeCompare(b[0]);
        if (sortBy === 'need') return a[1].localeCompare(b[1]);
        if (sortBy === 'response') return a[2].localeCompare(b[2]);
        return 0;
    });
}

function renderTable(data) {
    console.log('开始渲染表格，数据行数:', data.length);
    const container = document.getElementById('data-container');
    
    if (!container) {
        console.error('未找到数据容器元素');
        return;
    }
    
    container.innerHTML = ''; // 清空容器
    if (data.length === 0) {
        container.innerHTML = '<p>没有找到匹配的数据</p>';
        return;
    }
    
    const table = document.createElement('table');
    
    // 创建表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // 添加序号列的表头
    const thNumber = document.createElement('th');
    thNumber.textContent = '序号';
    headerRow.appendChild(thNumber);
    
    parsedData.headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 创建表体
    const tbody = document.createElement('tbody');
    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('fade-in');
        
        // 添加序号列
        const tdNumber = document.createElement('td');
        tdNumber.textContent = index + 1;
        tr.appendChild(tdNumber);
        
        row.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            if (cellIndex === 0) {
                // 为情绪列添加图标和样式
                td.className = 'emotion-cell';
                const icon = document.createElement('i');
                icon.className = `fas ${getEmotionIcon(cell)} emotion-icon`;
                td.appendChild(icon);
                const textSpan = document.createElement('span');
                textSpan.className = 'emotion-text';
                textSpan.textContent = cell;
                td.appendChild(textSpan);
                const emotionColor = getEmotionColor(cell);
                td.style.setProperty('--emotion-color', emotionColor);
            } else {
                td.textContent = cell;
            }
            tr.appendChild(td);
        });
        
        // 添加详情按钮
        const tdDetails = document.createElement('td');
        const detailsBtn = document.createElement('button');
        detailsBtn.textContent = '详情';
        detailsBtn.className = 'details-btn';
        detailsBtn.style.setProperty('--emotion-color', getEmotionColor(row[0]));
        detailsBtn.addEventListener('click', function(event) {
            event.preventDefault(); // 阻止默认行为
            console.log('Details button clicked for:', row[0]);
            console.log('Row data:', row);
            showModal(row[0], row[3] || '暂无详细信息');
        });
        tdDetails.appendChild(detailsBtn);
        tr.appendChild(tdDetails);
        
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    container.appendChild(table);
    console.log('表格已添加到容器中，表格行数:', table.rows.length);

    addKeyboardNavigation();
}

function addKeyboardNavigation() {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tbody tr');
    let currentFocus = -1;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus = (currentFocus + 1) % rows.length;
            rows[currentFocus].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus = (currentFocus - 1 + rows.length) % rows.length;
            rows[currentFocus].focus();
        }
    });

    rows.forEach(row => {
        row.setAttribute('tabindex', '0');
    });
}

function highlightSearchResults(searchTerm) {
    const table = document.querySelector('table');
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let found = false;
        cells.forEach(cell => {
            if (cell.textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                cell.classList.add('highlight');
                found = true;
            } else {
                cell.classList.remove('highlight');
            }
        });
        row.style.display = found ? '' : 'none';
    });
}