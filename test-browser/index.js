// Adjust the path to your cloned library's source
import { Level2Radar } from "nexrad-level-2-data";
const status = document.getElementById("status");
status.innerHTML = "Initializing";

async function runTest () {
  status.innerHTML += "<br>\nFetching level2 data";
  const response = await fetch("/KLOT20220317_000842_V06");
  status.innerHTML += "<br>\nData is fetched, requesting arrayBuffer";
  const buf = await response.arrayBuffer();
  status.innerHTML += "<br>\narrayBuffer received, converting to Uint8Array";
  // console.log(buf);
  const bytes = new Uint8Array(buf);
  status.innerHTML += "<br>\nConverted. Parsing...";
  Level2Radar(bytes).then(l2 => {
    status.innerHTML += "<br>\nDone parsing.";
    console.log(l2);
  })
    .catch(err => console.error(err));
}
runTest();