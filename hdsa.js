/*  20180814 Darcy McLean                                                       */
/*  HubDoc Skills Assessment                                                     */
/*  This assignment:                                                            */
/*  1. navigates to http://datatables.net via google search ("datatables").     */
/*  2. fetches/extracts data from the table into an array.                      */
/*  3. exports results as array via CSV.                                        */

// Require Puppeteer node library to run a headless copy of Chrome.
const puppeteer = require('puppeteer');

// Require FileSystem to export the results as a CSV file. 
const fs = require('fs');

console.log('Starting Web Scraper...')

let webscraper = async () => {
    // Setup browser/page to handle the google search and other navigation.
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Navigate to google for searching in an appropriate sized window.
    //await page.goto('http://www.google.com/');
    await page.setViewport({width: 1000, height: 500})
    await page.goto('https://google.com', { waitUntil: 'networkidle0' });

    // Type datatables into the google search inputbox.
    await page.type('#lst-ib', 'datatables ');

    // Click search.
    await page.click('input[type="submit"]');

    await page.waitForSelector('h3 a');
    
    const datapage = await page.$$('h3 a');
    await datapage[0].click();
    await page.waitForSelector('#example_wrapper');

    const result = await page.evaluate(() => {
        let tableData = Array.prototype.map.call(document.querySelectorAll('table tr'), function(tr){
            return Array.prototype.map.call(tr.querySelectorAll('td'), function(td){
                return td.innerHTML;
            });
        });

        // Remove the first and last element in the array because it has the column names in the original table.
        tableData.shift();
        tableData.pop();

        return tableData; // Return our data array
    });

    // Close the browser once done.
    browser.close();


    //console.log(result[2]);
    return result;
    // Return "test".
    //return "test";
    //return strTest; // Return our data array
};

webscraper().then((value) => {
    //console.log(value); // Success!
    // fs.writeFile('output.csv', value, 'utf8', function (err) {
    //     console.log('Results Exported!')
    //   })
    let file = fs.createWriteStream('output.csv');
    file.on('error', function(err) { /* error handling */
        console.log('Error exporting file!\nWeb Scraper Failed.') 
    });
    value.forEach(function(v) { file.write(v.join(', ') + '\n'); });
    file.on('finish', function () {
        console.log('Results exported successfully!\nWeb Scraper Finished.');
      });
    file.end();

});
