const toRemove = require('./wordsToRemove');
const puppeteer = require('puppeteer');
const $ = require('cheerio');

function getFrequency(string) {
	var freq = {};
	for (var i = 0; i < string.length; i++) {
		var character = string[i];
		if (freq[character]) {
			freq[character]++;
		} else {
			freq[character] = 1;
		}
	}

	var sortable = [];
	for (var word in freq) {
		sortable.push([word, freq[word]]);
	}

	sortable.sort(function (a, b) {
		return b[1] - a[1];
	});
	return sortable;
};

async function countWordsByUrl(url) {
	return new Promise((resolve, reject) => {
		puppeteer
			.launch()
			.then(function (browser) {
				return browser.newPage();
			})
			.then(function (page) {
				return page.goto(url).then(function () {
					return page.content();
				});
			})
			.then(function (html) {
				$('[class=mw-parser-output]', html).each(function () {
	
					let text = $(this).text();
					text.replace(/[^\w\s]/gi, ' ');
					var dizi = text.replace(/\n/g, ' ').replace(/[^a-zA-Z ]/g, "");
					var array = dizi.split(" ");
					allWords = array.filter(x => !toRemove.has(x));
					resolve(allWords)
				});
			})
	})
}

Promise.all([countWordsByUrl('https://en.wikipedia.org/wiki/Democratic_republic'), 
			countWordsByUrl('https://en.wikipedia.org/wiki/Politics_of_the_United_States')])
	.then(values => {
		let difference = values[0].filter(x => !values[1].includes(x));
		similarityPercentage = (values[0].length - difference.length) / values[0].length * 100;
		console.log("That 2 page's similarity percentage is %" + similarityPercentage.toFixed(2));
		console.log("Top 15 Words for first link: ", getFrequency(values[0]).slice(0, 15));
		console.log("Top 15 Words for second link: ", getFrequency(values[1]).slice(0, 15));
	}
)