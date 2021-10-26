import { HebrewCalendar, Location } from "@hebcal/core";
import { eventsToClassicApi } from "@hebcal/rest-api";
import zipcode_to_timezone from "zipcode-to-timezone";
import zipToCoordinatesMap from "./zip_to_coordinates.json";

const ZIP_REGEX = /\d{5}/;

const handleIsChagQuery = (timestamp, zip) => {
  const nowString = timestamp;

  const now = new Date(nowString);

  if (!ZIP_REGEX.test(zip)) {
    return `sorry zip <${zip}> looks invalid`;
  }
  const todayString = nowString.split("T")[0];
  const [year, month, day] = todayString.split("-").map((n) => parseInt(n, 10));
  const zipLocation = Location.lookup(zip);
  if (!zipLocation) {
    return `could not find location for zip: ${zip}`;
  }

  const options = {
    year,
    month,
    candlelighting: true,
    location: zipLocation,
  };

  const events = eventsToClassicApi(HebrewCalendar.calendar(options), options);

  const todayEvents = events.items.filter((event) => {
    const eventDateString = event.date.split("T")[0];
    return todayString === eventDateString;
  });

  if (todayEvents.length > 1) {
    throw new Error(`we are not set up to handle multiple events per day yet`);
  }

  const todayEvent = todayEvents[0];
  if (!todayEvent) {
    return `No. Today (${todayString}) is not Chag in ${zip}`;
  }

  const eventDate = new Date(todayEvent.date);

  // for debugging
  const chagState = {
    isYomTov: todayEvent.yomtov,
    isCandles: todayEvent.category === "candles",
    isHavdalah: todayEvent.category === "havdalah",
    isBeforeEvent: now < eventDate,
    isAtOrAfterEvent: now >= eventDate,
  };

  if (todayEvent.yomtov) {
    return `Yes! Today (${todayString}) is ${todayEvent.title} (${todayEvent.subcat} ${todayEvent.category}) in ${zip}`;
  } else if (todayEvent.category === "candles" && now >= eventDate) {
    return `Yes! Candle lighting was at ${todayEvent.date} in ${zip}`;
  } else if (todayEvent.category === "candles" && now < eventDate) {
    return `No! Candle lighting will be at ${todayEvent.date} in ${zip}`;
  } else if (todayEvent.category === "havdalah" && now <= eventDate) {
    return `Yes! Havdalah will be at ${todayEvent.date} in ${zip}`;
  } else if (todayEvent.category === "havdalah" && now > eventDate) {
    return `No! Havdalah was at ${todayEvent.date} in ${zip}`;
  } else {
    return `No. Today (${todayString}) is not Chag in ${zip}`;
  }
};

const addZips = () => {
  Object.keys(zipToCoordinatesMap).forEach((zip) => {
    const [lat, lng] = zipToCoordinatesMap[zip];
    const timeZone = zipcode_to_timezone.lookup(zip);

    const l = new Location(lat, lng, false, timeZone, zip, "US");

    const success = Location.addLocation(zip, l);

    if (!success) {
      console.warn(`failed to add ${zip}`);
    }
  });
};

const getNow = () => {
  const now = new Date();
  const nowStr = now.toISOString();

  return nowStr.replace("2021-10-26", "2021-10-30");
};

export { getNow, addZips, handleIsChagQuery };
