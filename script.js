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
            csvData = data;
            console.log('CSV数据加载成功，长度:', csvData.length);
            console.log('CSV数据前100个字符:', csvData.substring(0, 100));
            
            parsedData = parseCSV(csvData);
            if (!parsedData || !Array.isArray(parsedData.data) || parsedData.data.length === 0) {
                throw new Error('解析后的数据无效或为空');
            }
            currentData = parsedData.data;
            renderTable(currentData);
        })
        .catch(error => {
            console.error('加载CSV文件时出错:', error);
            dataContainer.innerHTML = `<p>加载数据时出错: ${error.message}</p>`;
        });
});

let parsedData;
let currentData = [];

function parseCSV(csv) {
    try {
        console.log('开始解析CSV，数据类型:', typeof csv);
        console.log('CSV数据长度:', csv.length);
        console.log('CSV数据前100个字符:', csv.substring(0, 100));
        
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
            // 添加更多的数据验证逻辑
            return values;
        }).filter(row => row !== null);
        
        console.log('解析后的数据行数:', data.length);
        console.log('解析后的数据示例:', data.slice(0, 3));
        
        if (data.length === 0) {
            throw new Error('CSV 数据为空或格式不正确');
        }
        
        console.log('解析后的数据:', { headers, data });
        return { headers, data };
    } catch (error) {
        console.error('CSV解析错误:', error);
        console.error('CSV内容:', csv);
        throw error;
    }
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
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');

    // 创建模态框内容
    const modalHTML = `
        <div class="modal-header">
            <h2 class="modal-title">详情</h2>
            <span class="close">&times;</span>
        </div>
        <div class="modal-body">
            <div class="modal-emotion">
                <i class="fas ${getEmotionIcon(emotion)} modal-emotion-icon" style="color: ${getEmotionColor(emotion)};"></i>
                <div class="modal-emotion-text" style="color: ${getEmotionColor(emotion)};">${emotion}</div>
            </div>
            <div class="modal-description">${content.replace(/\n/g, '<br>')}</div>
        </div>
    `;

    modalContent.innerHTML = modalHTML;

    modal.style.display = 'block';

    const closeBtn = modalContent.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
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
    try {
        console.log('开始渲染表格');
        console.log('数据:', data);
        console.log('parsedData:', parsedData);
        
        if (!Array.isArray(data) || !parsedData || !Array.isArray(parsedData.headers)) {
            throw new Error('数据结构不正确');
        }
        
        const container = document.getElementById('data-container');
        if (!container) {
            throw new Error('未找到数据容器元素');
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
            detailsBtn.onclick = () => showModal(row[0], row[3]);
            tdDetails.appendChild(detailsBtn);
            tr.appendChild(tdDetails);
            
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        container.appendChild(table);
        console.log('表格已添加到容器中，表格行数:', table.rows.length);

        addKeyboardNavigation();
    } catch (error) {
        console.error('渲染表格时出错:', error);
        const errorContainer = document.getElementById('data-container') || document.body;
        errorContainer.innerHTML = `<p>渲染数据时出错: ${error.message}</p>`;
    }
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