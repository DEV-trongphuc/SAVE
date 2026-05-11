const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');

const SYMBOL_API_URL = 'https://api-finfo.vndirect.com.vn/v4/stocks?q=type:STOCK~status:LISTED&size=2000';

async function getSymbols() {
    try {
        const response = await axios.get(SYMBOL_API_URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (response.data && response.data.data) {
            return response.data.data.map(item => item.code);
        }
    } catch (error) {
        console.error('Error fetching symbols:', error.message);
    }
    return [];
}

async function fetchBod(symbol) {
    const url = `https://finance.vietstock.vn/${symbol}/ban-lanh-dao.htm`;
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const tables = $('table');
        
        let foundData = [];
        
        tables.each((i, table) => {
            const headers = [];
            $(table).find('th').each((j, th) => {
                headers.push($(th).text().trim());
            });
            
            // Check if this table is the Ban lanh dao table
            if (headers.includes('Họ và tên') && headers.includes('Chức vụ')) {
                const nameIdx = headers.indexOf('Họ và tên');
                const titleIdx = headers.indexOf('Chức vụ');
                const yearIdx = headers.indexOf('Thời gian gắn bó');
                const eduIdx = headers.indexOf('Trình độ');
                
                $(table).find('tbody tr').each((k, tr) => {
                    const cells = $(tr).find('td');
                    if (cells.length > 0) {
                        let offset = 0;
                        // Handle HTML rowspan for the first column ('Thời gian')
                        if (headers[0] === 'Thời gian' && cells.length === headers.length - 1) {
                            offset = -1;
                        } else if (cells.length < headers.length) {
                            offset = cells.length - headers.length;
                        }

                        const name = $(cells[nameIdx + offset]).text().trim();
                        const title = $(cells[titleIdx + offset]).text().trim();
                        const year = yearIdx !== -1 && (yearIdx + offset >= 0) ? $(cells[yearIdx + offset]).text().trim() : '';
                        const edu = eduIdx !== -1 && (eduIdx + offset >= 0) ? $(cells[eduIdx + offset]).text().trim() : '';
                        
                        if (name && name !== '***' && name !== '-') {
                            foundData.push({
                                'Mã Cổ Phiếu': symbol,
                                'Họ và Tên': name,
                                'Chức vụ': title,
                                'Năm bổ nhiệm': year,
                                'Trình độ': edu
                            });
                        }
                    }
                });
            }
        });
        
        return foundData;
    } catch (error) {
        // Ignore errors for individual requests
        return [];
    }
}

async function main() {
    console.log('Fetching symbol list...');
    const symbols = await getSymbols();
    console.log(`Found ${symbols.length} symbols. Start crawling...`);
    
    let allData = [];
    const BATCH_SIZE = 50; // Concurrency limit
    
    let processed = 0;
    
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
        const batch = symbols.slice(i, i + BATCH_SIZE);
        const promises = batch.map(sym => fetchBod(sym));
        
        const results = await Promise.allSettled(promises);
        
        for (const res of results) {
            if (res.status === 'fulfilled' && res.value.length > 0) {
                allData = allData.concat(res.value);
            }
        }
        
        processed += batch.length;
        console.log(`Processed ${processed}/${symbols.length}...`);
    }
    
    if (allData.length > 0) {
        // Sort
        allData.sort((a, b) => a['Mã Cổ Phiếu'].localeCompare(b['Mã Cổ Phiếu']));
        
        // Export to Excel
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(allData);
        xlsx.utils.book_append_sheet(wb, ws, 'BanLanhDao');
        const filename = 'Ban_Lanh_Dao_NodeJS_Fix.xlsx';
        xlsx.writeFile(wb, filename);
        console.log(`Done! Saved to ${filename}. Total rows: ${allData.length}`);
    } else {
        console.log('No data found!');
    }
}

main();