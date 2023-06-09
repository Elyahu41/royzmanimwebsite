//@ts-check

import { MDCSelect } from "./libraries/selector.js"
import * as KosherZmanim from "./libraries/dev/kosher-zmanim.esm.js"
export { ChaiTables }

class ChaiTables {
	/**
	 * @param {KosherZmanim.GeoLocation} geoLocation
	 */
	constructor(geoLocation) {
		this.geoData = geoLocation;
	}

	/**
	 * @param {String} selectedCountry
	 * @param {Number} indexOfMetroArea
	 */
	setOtherData(selectedCountry, indexOfMetroArea) {
		this.selectedCountry = selectedCountry;
		this.indexOfMetroArea = indexOfMetroArea;
	}

	/**
	 * STEP 3
	 * Returns the full chaitables url after everything has been setup. See {@link #selectCountry(ChaiTablesCountries)} and {@link #selectMetropolitanArea(String)}
	 * @return the full link directly to the chai tables for the chosen neighborhood
	 *
	 * @param {Number} searchradius The search radius in kilometers.
	 * @param {0|1|2|3|4|5} type the type of table you want.
	 *             0 is visible sunrise,
	 *             1 is visible sunset,
	 *             2 is mishor sunrise,
	 *             3 is astronomical sunrise,
	 *             4 is mishor sunset,
	 *             5 is astronomical sunset.
	 * @param {KosherZmanim.JewishCalendar} jewishCalendar the desired hebrew year for the chaitable link
	 * @param {Number} userId the user id for the chaitables link
	 * @param {Boolean} switchLongitude
	 */
	getChaiTablesLink(searchradius, type, jewishCalendar, userId, switchLongitude) {
		if (type < 0 || type > 5) {
			throw new Error("type of tables must be between 0 and 5");
		}

		const isIsraelCities = this.selectedCountry == "Eretz_Yisroel";

		const urlParams = {
			'TableType': (isIsraelCities ? "BY" : "Chai"),
			'country': this.selectedCountry,
			'USAcities1': (isIsraelCities ? 1 : this.indexOfMetroArea),
			USAcities2: 0,
			searchradius: (isIsraelCities ? "" : this.selectedCountry == "Israel" ? 2 : searchradius),
			"eroslatitude": (isIsraelCities ? 0.0 : this.geoData.getLatitude()),
			"eroslongitude": (isIsraelCities ? 0.0 : switchLongitude ? -this.geoData.getLongitude() : this.geoData.getLongitude()),
			eroshgt: 0.0,
			geotz: jewishCalendar.getDate().setZone(this.geoData.getTimeZone()).offset / 60,
			exactcoord: "OFF",
			MetroArea: (isIsraelCities ? this.indexOfMetroArea : "jerusalem"),
			types: type,
			RoundSecond: -1,
			AddCushion: 0,
			"24hr": "",
			typezman: -1,
			yrheb: jewishCalendar.getJewishYear(),
			optionheb: 1,
			UserNumber: userId,
			Language: "English",
			AllowShaving: "OFF"
		};

		const url = new URL("http://www.chaitables.com/cgi-bin/ChaiTables.cgi/")
		for (let [key, value] of Object.entries(urlParams)) {
			if (typeof value !== "string")
				value = value.toString()

			url.searchParams.set("cgi_" + key, value)
		}

		return url;
	}


	/**
	 * @param {string} htmlBody
	 * @param {number} year
	 * @param {number} timezone
	 */
	extractData (htmlBody, year, timezone) {
		const calendar = new KosherZmanim.JewishCalendar();
		calendar.setJewishYear(year)
		const data = {
			lng: this.geoData.getLongitude(),
			lat: this.geoData.getLatitude(),
			times: []
		}

		const domParsed = new DOMParser().parseFromString(htmlBody, "text/xml");

		const zmanTable = Array.from(domParsed.getElementsByTagName('table'))
			.find(table=>[14,15].includes(table.rows[0].cells.length));

		const isLeapYear = zmanTable.rows[0].cells.length == 15;
		const monthIndexers = (!isLeapYear ? [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6] : [8, 9, 10, 11, 12, 13, 1, 2, 3, 4, 5, 6, 7]).entries()
		for (let rowIndexString in zmanTable.rows) {
			let rowIndex = parseInt(rowIndexString);

			if (rowIndex == 0)
				continue;

			for (let [monthValue, monthCellIndex] of monthIndexers) {
				const zmanTime = zmanTable.rows[rowIndex].cells[monthCellIndex].innerText
				if (!zmanTime)
					continue;
				const [hour, minute, second] = zmanTime.split(":").map(time=> parseInt(time))

				calendar.setJewishDate(year, 1+monthValue, parseInt(zmanTable.rows[rowIndex].cells[0].innerText))
				const time = calendar.getDate();
				const newTime = time.set({ hour, minute, second }).setZone(window.luxon.FixedOffsetZone.instance(timezone))
				data.times.push(newTime.toMillis())
			}
		}

		return data;
	}

	/** @param {HTMLElement} modal */
	initForm(modal) {
		const selectors = Array.from(document.getElementsByClassName("mdc-select"));
		const MDCSelectors = selectors.map(selectElem => new MDCSelect(selectElem))

		
	}

	formSubmit() {

	}
}

/*
let MutationObserver = window.MutationObserver;
if (!MutationObserver && 'WebKitMutationObserver' in window)
	// @ts-ignore
	MutationObserver = window.WebKitMutationObserver
/**
 * @param {Element} obj
 * @param {() => void} callback

function observeDOM (obj, callback){

	if (MutationObserver || callback){
		// define a new observer
		const mutationObserver = new MutationObserver(callback)

		// have the observer observe for changes in children
		mutationObserver.observe( obj, { childList:true, subtree:true })
		return mutationObserver
	} else if( window.addEventListener ){
		// browser support fallback
		obj.addEventListener('DOMNodeInserted', callback, false)
		obj.addEventListener('DOMNodeRemoved', callback, false)
	}
} */