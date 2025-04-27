// Adjust the path to your cloned library's source
import { Level2Radar } from "nexrad-level-2-data";

const status = document.getElementById("status");
status.innerHTML = "Initializing...";

async function runTest () {
  const response = await fetch("/KLOT20220317_000842_V06");
  const buf = await response.arrayBuffer();
  // console.log(buf);
  const bytes = new Uint8Array(buf);
  Level2Radar(bytes).then(l2 => {
    console.log(l2);
  })
    .catch(err => console.error(err));
}
runTest();