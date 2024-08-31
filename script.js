document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM加载完成');
        const dataContainer = document.getElementById('data-container');
        console.log('数据容器元素:', dataContainer);
        
        if (!dataContainer) {
            throw new Error('未找到数据容器元素');
        }
        
        dataContainer.innerHTML = '<p>正在加载数据...</p>';

        console.log('开始解析CSV数据');
        if (typeof csvData === 'undefined' || csvData === null) {
            throw new Error('csvData 未定义或为null');
        }
        console.log('CSV数据类型:', typeof csvData);
        console.log('CSV数据长度:', csvData.length);
        console.log('CSV数据前100个字符:', csvData.substring(0, 100));
        
        parsedData = parseCSV(csvData);
        console.log('CSV解析完成，开始渲染表格');
        if (parsedData.data.length === 0) {
            throw new Error('没有有效的数据');
        }
        currentData = parsedData.data;
        renderTable(currentData);

        // 确保数据容器可见
        dataContainer.style.display = 'block';
        console.log('表格渲染完成，数据容器已显示');

        const lightModeButton = document.getElementById('light-mode');
        const darkModeButton = document.getElementById('dark-mode');
        const systemModeButton = document.getElementById('system-mode');
        const body = document.body;

        function setTheme(theme) {
            console.log('设置主题:', theme);
            document.body.classList.remove('light-mode', 'dark-mode');
            document.querySelectorAll('.theme-button').forEach(btn => btn.classList.remove('active'));
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                document.getElementById('dark-mode').classList.add('active');
            } else if (theme === 'light') {
                document.body.classList.add('light-mode');
                document.getElementById('light-mode').classList.add('active');
            } else {
                // 系统模式
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.add('light-mode');
                }
                document.getElementById('system-mode').classList.add('active');
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

        window.matchMedia('(prefers-color-scheme: dark)').addListener(applyTheme);

        const sortSelect = document.getElementById('sort');
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            if (sortBy) {
                currentData = sortData(currentData, sortBy);
                renderTable(currentData);
            }
        });

        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = parsedData.data.filter(row => 
                row.some(cell => cell.toLowerCase().includes(searchTerm))
            );
            currentData = filteredData;
            renderTable(currentData);
            highlightSearchResults(searchTerm);
        });

        // 显示数据容器
        dataContainer.style.display = 'block';
        console.log('表格渲染完成');
    } catch (error) {
        console.error('初始化错误:', error);
        const errorContainer = document.getElementById('data-container') || document.body;
        errorContainer.innerHTML = `<p>加载数据时出错: ${error.message}</p>`;
    }
});

const csvData = `负面情绪,需求,应对,详细说明,详细
生气,宣泄,倾听,"生气是一种常见的情绪反应，通常源于感到被冒犯、受挫或不公平对待。"
伤心,释放、放下,倾听、陪伴,"伤心是一种情绪反应，通常源于失去重要的人或物，或者面临挫折和挑战。"
恐惧,希望,换角度提问，给予希望,"恐惧是一种情绪反应，通常源于对未来的不确定性和潜在的威胁。"
痛苦,倾诉,倾听、理解,"痛苦是一种情绪反应，通常源于身体上的不适或心理上的煎熬。"
委屈,理解,还原困难场景,"委屈是一种情绪反应，通常源于感到被冒犯、受挫或不公平对待。"
遗憾、后悔,自责,安慰、鼓励,"遗憾和后悔是一种情绪反应，通常源于对过去的失误或错过的机会感到懊恼。"
内疚,补偿,倾听、安慰,"内疚是一种情绪反应，通常源于对自己的行为或决定感到负罪感。"
自卑,鼓励,鼓励、赞美,"自卑是一种情绪反应，通常源于对自己的能力或价值的怀疑。"
焦虑,害怕失去,理性分析事件,"焦虑是一种情绪反应，通常源于对未来的不确定性和潜在的损失感。"
怨恨,复仇,消除、放下,"怨恨是一种情绪反应，通常源于对他人的不公平待遇或伤害。"
厌烦,远离,离开,"厌烦是一种情绪反应，通常源于对重复性任务或无聊事物的厌倦。"
痛恨,复仇,消除、放下,"痛恨是一种情绪反应，通常源于对他人的不公平待遇或伤害。"
嫉妒,超越,换角度提问，给予希望,"嫉妒是一种情绪反应，通常源于对他人的成就或优势的羡慕。"
尴尬,不被注视,转移话题,"尴尬是一种情绪反应，通常源于感到不自在或尴尬的情况。"
回避,远离,离开,"回避是一种情绪反应，通常源于对某种情况或人的避免。"
低落,安抚,转化情绪,"低落是一种情绪反应，通常源于对生活的失望或沮丧。"
泪哀,理解、安抚,鼓励、希望,"泪哀是一种情绪反应，通常源于强烈的情感或感动。"
忧伤、悲伤,安静,陪伴,"忧伤和悲伤是一种情绪反应，通常源于失去重要的人或物，或者面临挫折和挑战。"
不耐烦,远离,离开,"不耐烦是一种情绪反应，通常源于对等待或忍耐的不耐烦。"`;

console.log('CSV数据:', csvData);
console.log('CSV数据长度:', csvData.length);
console.log('CSV数据前100个字符:', csvData.substring(0, 100));

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
                console.warn(`第${index + 2}行数据不匹配:`, values);
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
    } catch (error) {
        console.error('CSV解析错误:', error);
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
    console.log('开始渲染表格，数据行数:', data.length);
    console.log('渲染的数据示例:', data.slice(0, 3));
    const container = document.getElementById('data-container');
    console.log('数据容器元素:', container);
    
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
        detailsBtn.onclick = () => showModal(row[0], row[3]);
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