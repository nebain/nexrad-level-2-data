// Adjust the path to your cloned library's source
import { Level2Radar } from "nexrad-level-2-data";

const status = document.getElementById("status");
status.innerHTML = "Initializing...";

async function runTest () {
  const response = await fetch("/KLOT20200715_230602_V06");
  const bytes = await response.bytes();
  const l2 = new Level2Radar(bytes);
  console.log(l2);
}
runTest();