let countyURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
let educationURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

let statePath = "./assets/S07_AC.json";
let educationPath = "./assets/Sample_HR.json";

let countyData;
let educationData;
let stateData;
const path = d3.geoPath();
let canvas = d3.select("#canvas");
let g = canvas.append("g");
let tooltip = document.getElementById("tooltip");

window.onmousemove = function (e) {
  const x = e.clientX,
    y = e.clientY;
  tooltip.style.top = y - 95 + "px";
  tooltip.style.left = x + 20 + "px";
};

// Define the initial width and height of the SVG element
let width = +canvas.attr("width");
let height = +canvas.attr("height");

// Define the initial scale and translation for the map
let scale = 10;
let translateX = width / 2;
let translateY = height / 2;

let appliedFeatures = [];

let newTranslateX, newTranslateY, newScale;

const assets1 = document.getElementById("assets1");
const assets2 = document.getElementById("assets2");
const assets3 = document.getElementById("assets3");
const criminalCases1 = document.getElementById("criminalCases1");
const criminalCases2 = document.getElementById("criminalCases2");
const party1 = document.getElementById("party1");
const party2 = document.getElementById("party2");
const party3 = document.getElementById("party3");
const party4 = document.getElementById("party4");
const gender1 = document.getElementById("gender1");
const gender2 = document.getElementById("gender2");
const gender3 = document.getElementById("gender3");
const voteShare1 = document.getElementById("voteShare1");
const voteShare2 = document.getElementById("voteShare2");

const clickTracking = {
  assets1: false,
  assets2: false,
  assets3: false,
  criminalCases1: false,
  criminalCases2: false,
  party1: false,
  party2: false,
  party3: false,
  party4: false,
  gender1: false,
  gender2: false,
  gender3: false,
  voteShare1: false,
  voteShare2: false,
};

const bucketNames = {
  assets1: "assets_bucket",
  assets2: "assets_bucket",
  assets3: "assets_bucket",
  criminalCases1: "criminal_cases",
  criminalCases2: "criminal_cases",
  party1: "party",
  party2: "party",
  party3: "party",
  party4: "party",
  gender1: "gender",
  gender2: "gender",
  gender3: "gender",
  voteShare1: "vote_share_bucket",
  voteShare2: "vote_share_bucket",
};

const bucketValues = {
  assets1: "Less than 10Cr",
  assets2: "10Cr - 50Cr",
  assets3: "More than 50Cr",
  criminalCases1: "Yes",
  criminalCases2: "No",
  party1: "BJP",
  party2: "INC",
  party3: "JJP",
  party4: "Other",
  gender1: "male",
  gender2: "female",
  gender3: "transgender",
  voteShare1: "Less than 50%",
  voteShare2: "More than 50%",
};

const allKeys = Object.keys(clickTracking);

// populate appliedFeatures
const selected = (key) => {
  return clickTracking[key];
};
appliedFeatures = allKeys.filter((key) => selected(key));
console.log("appliedFeatures : ", appliedFeatures);

let drawHRMap = () => {
  // console.log("appliedFeatures : ", appliedFeatures);
  g.selectAll("path")
    .data(stateData)
    .enter()
    .append("path")
    .attr("x", 70)
    .attr("y", 70)
    .attr("id", (stateDataItem) => {
      return "constituency" + stateDataItem["properties"]["AC_CODE"];
    })
    .attr("d", path)
    .attr("class", "constituency")
    .attr("transform", `translate(-12800, -4820) scale(175) `)
    // .attr("transform", `translate(-7765, -2820) scale(105) `)
    .attr("fill", (stateDataItem) => {
      let id = stateDataItem["properties"]["AC_CODE"];
      let constituency = educationData.find((item) => {
        return item["ac_no"] == id;
      });

      let party = constituency["party"];

      if (party == "INC") {
        return "#cbe3f2";
      } else if (party == "BJP") {
        return "#e5adf0";
      } else if (party == "JJP") {
        return "#adb1f0";
      } else {
        return "#f0ecad";
      }
      // } else return "white";
    })
    .on("mouseover", (stateDataItem) => {
      tooltip.style.visibility = "visible";
      const id = stateDataItem["properties"]["AC_CODE"];
      const constituency = educationData.find((item) => {
        return item["ac_no"] == id;
      });
      const party = constituency["party"];
      let color, backgroundColor;
      if (party == "INC") {
        color = "#cbe3f2";
        backgroundColor = "rgba(203, 227, 242,0.1)";
      } else if (party == "BJP") {
        color = "#e5adf0";
        backgroundColor = "rgba(229, 173, 240,0.1)";
      } else if (party == "JJP") {
        color = "#adb1f0";
        backgroundColor = "rgba(173, 177, 240,0.1)";
      } else {
        color = "#f0ecad";
        backgroundColor = "rgba(240, 236, 173,0.1)";
      }

      const innerHTMLContent = `
        <mark style="color:#eab991">${constituency["ac_name"]}</mark>
        <hr  id="partition1">
        <mark style="color : white">${constituency["candidate_name"]}</mark>
        <hr  id="partition2">
        <mark style="color : ${color};border:1px solid ${backgroundColor};border-radius:3px;background:${backgroundColor};padding:0 2px">${constituency["party"]}</mark>
        <mark style="color : ${color};padding-left:10px">&#x25A0;</mark>
      `;

      tooltip.innerHTML = innerHTMLContent;
    })
    .on("mouseout", (stateDataItem) => {
      tooltip.style.visibility = "hidden";
    });
};

const updateMap = () => {
  console.log("updating map");
  educationData.map((constituency) => {
    let newColor;
    const region = g.select("#" + "constituency" + constituency["ac_no"]);
    let party = constituency["party"];
    let returnColor = false;

    const selectedBuckets = {
      assets_bucket: [],
      criminal_cases: [],
      party: [],
      gender: [],
      vote_share_bucket: [],
    };
    const finalBucketNames = {
      assets_bucket: false,
      criminal_cases: false,
      party: false,
      gender: false,
      vote_share_bucket: false,
    };

    if (appliedFeatures.length == 0) {
      returnColor = true;
      console.log
    } else {
      for (let i = 0; i < appliedFeatures.length; i++) {
        const feature = appliedFeatures[i];
        const featureBucketValue = bucketValues[feature];
        const featurebucketName = bucketNames[feature];
        selectedBuckets[featurebucketName].push(featureBucketValue);
        if (
          selectedBuckets.assets_bucket.includes(constituency["assets_bucket"])
        ) {
          finalBucketNames.assets_bucket = true;
        }
        if (
          selectedBuckets.criminal_cases.includes(
            constituency["criminal_cases"]
          )
        ) {
          finalBucketNames.criminal_cases = true;
        }
        if (selectedBuckets.party.includes(constituency["party"])) {
          finalBucketNames.party = true;
        }
        if (selectedBuckets.gender.includes(constituency["gender"])) {
          finalBucketNames.gender = true;
        }
        if (
          selectedBuckets.vote_share_bucket.includes(
            constituency["vote_share_bucket"]
          )
        ) {
          finalBucketNames.vote_share_bucket = true;
        }

        const selectedBucketLabels = [];

        const finalPointers = [];
        Object.keys(selectedBuckets).map((key) => {
          if (selectedBuckets[key].length != 0) selectedBucketLabels.push(key);
        });

        selectedBucketLabels.map((bucketName) => {
          if (finalBucketNames[bucketName]) finalPointers.push(true);
          else finalPointers.push(false);
        });
        if (finalPointers.includes(false)) returnColor = false;
        else returnColor = true;
      }

      if (returnColor) {
        if (party == "INC") {
          newColor = "#cbe3f2";
        } else if (party == "BJP") {
          newColor = "#e5adf0";
        } else if (party == "JJP") {
          newColor = "#adb1f0";
        } else {
          newColor = "#f0ecad";
        }
      } else newColor = "white";
    }
    // console.log("newColor : ", newColor);
    region.attr("fill", newColor);
  });
};

d3.json(statePath).then((data, error) => {
  if (error) {
    // console.log(log);
  } else {
    stateData = data.features;
    // console.log(stateData);

    d3.json(educationPath).then((data, error) => {
      if (error) {
        console.log(error);
      } else {
        educationData = data;
        // console.log(educationData);
        drawHRMap();
      }
    });
  }
});

// Set up an event listener for window resize
window.addEventListener("resize", () => {
  const windowWidth = window.innerWidth;
  const scale = 0.073715248 * windowWidth + 71.79865206;
  const translateX = -(5.30223 * windowWidth + 5376.874);
  const translateY = -(2.10614 * windowWidth + 1871.39);
  g.selectAll("path").attr(
    "transform",
    `translate(${translateX},${translateY}) scale(${scale})`
  );
});

const checkKeys = () => {
  const selected = (key) => {
    return clickTracking[key];
  };
  appliedFeatures = allKeys.filter((key) => selected(key));
  console.log("appliedFeatures : ", appliedFeatures);
  updateMap();
};

const handleFilterSelection = (event) => {
  const currentId = event.target.id;
  const startsWith = "clicked";
  console.log("currentId : ", currentId);
  // look for the substring "clicked", if it is there, get the rest of the string, use it as a property and set
  if (currentId.includes(startsWith, 0)) {
    const idSufix = currentId.slice(7, currentId.length);
    const newId = idSufix.charAt(0).toLowerCase() + idSufix.slice(1);
    console.log("newId : ", newId);
    clickTracking[newId] = false;
    event.target.id = newId;
    console.log("event.target.id : ", event.target.id);
  } else {
    const newId =
      startsWith + currentId.charAt(0).toUpperCase() + currentId.slice(1);
    console.log("newId : ", newId);
    clickTracking[currentId] = true;
    event.target.id = newId;
    console.log("event.target.id : ", event.target.id);
  }
  checkKeys();
};
