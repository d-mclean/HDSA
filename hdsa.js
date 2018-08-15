/*  20180815 Darcy McLean                                                       */
/*  HubDoc Skills Assessment Assignment                                         */
/*  This assignment:                                                            */
/*  1. navigates to http://datatables.net via google search ("datatables").     */
/*  2. fetches/extracts data from the table into an array.                      */
/*  3. exports results as array via CSV (results.csv).                          */

// Require Puppeteer node library to run a headless copy of Chrome.
const puppeteer = require('puppeteer');

// Require FileSystem to export the results as a CSV file. 
const fs = require('fs');

// Notify user when starting.
console.log('Starting Web Scraper...')

// Start the web scraper.
let webscraper = async () => {
    // Setup browser/page to handle the google search and other navigation.
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();

    // Navigate to google for searching in an appropriate sized window.
    await page.setViewport({width: 1000, height: 500});
    await page.goto('https://google.com', { waitUntil: 'networkidle0' });

    // Type datatables into the google search inputbox (with a space to assist avoiding autocomplete).
    await page.type('#lst-ib', 'datatables ');

    // Clicking search (i.e. [await page.click('input[type="submit"]');]) can incorrectly 
    // use an autocomplete suggestion so press enter via the keyboard instead.
    await page.keyboard.press('Enter');

    // Wait for results from Google.
    await page.waitForSelector('h3 a');
    
    // Click on the first page from the Google search results.
    const datapage = await page.$$('h3 a');
    await datapage[0].click();

    // Wait for the datatables page to load with the example table.
    await page.waitForSelector('#example_wrapper');

    // Loop through the table via map collecting each row from the HTML table.
    const result = await page.evaluate(() => {
        let tableData = Array.prototype.map.call(document.querySelectorAll('table tr'), function(tr){
            return Array.prototype.map.call(tr.querySelectorAll('td'), function(td){
                // Only return the text from the table cells.
                return td.innerHTML;
            });
        });

        // Remove the first and last element in the array because it has the column names in the original table.
        tableData.shift();
        tableData.pop();

        // Return our data array.
        return tableData;
    });

    // Close the browser once done.
    browser.close();

    // Return the table results so it can be output as a CSV file later.
    return result;
};

webscraper().then((value) => {
    // Create file for outputting results.
    let file = fs.createWriteStream('results.csv');
    file.on('error', function(err) { 
        // Basic error handling (i.e. for problems creating the file (locked or r/o)).
        console.log('Error exporting file!\nWeb Scraper Failed.');
    });

    // Add each 'row' of the table with a newline at the end.
    value.forEach(function(v) {
        file.write(v.join(', ') + '\n'); 
    });

    // Notify user when complete.
    file.on('finish', function () {
        console.log('Results exported successfully!\nWeb Scraper Finished.');
      });

    // Close the file.
    file.end();
});
