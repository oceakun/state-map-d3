const statePath = "../assets/S07_AC.json";
const educationPath = "../assets/Sample_HR.json";

let countyData;
let educationData;
let stateData;

const path = d3.geoPath();
const canvas = d3.select("#canvas");
const g = canvas.append("g");

const tooltip = document.getElementById("tooltip");
const menuBar = document.getElementById("menuBar");
const navbarWrapper = document.getElementById("navbarWrapper");

window.onmousemove = function (e) {
  const x = e.clientX,
    y = e.clientY;
  tooltip.style.top = y - 95 + "px";
  tooltip.style.left = x + 10 + "px";
};

// Define the initial width and height of the SVG element
const width = +canvas.attr("width");
const height = +canvas.attr("height");

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

// filters mapped to bucket names
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

// filters mapped to bucket values
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

// populate appliedFilters
const selected = (key) => {
  return clickTracking[key];
};
appliedFilters = allKeys.filter((key) => selected(key));

const drawHRMap = () => {
  // calculating initial scale and position for map
  const windowWidth = window.innerWidth;
  const scale = 0.073715248 * windowWidth + 71.79865206;
  const translateX = -(5.30223 * windowWidth + 5376.874);
  const translateY = -(2.10614 * windowWidth + 1871.39);

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
    .attr("transform", `translate(${translateX},${translateY}) scale(${scale})`)
    .attr("fill", (stateDataItem) => {
      const id = stateDataItem["properties"]["AC_CODE"];
      const constituency = educationData.find((item) => {
        return item["ac_no"] == id;
      });

      const party = constituency["party"];

      if (party == "INC") {
        return "#cbe3f2";
      } else if (party == "BJP") {
        return "#e5adf0";
      } else if (party == "JJP") {
        return "#adb1f0";
      } else {
        return "#f0ecad";
      }
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
  educationData.map((constituency) => {
    let newColor;
    const region = g.select("#" + "constituency" + constituency["ac_no"]);
    const party = constituency["party"];
    let returnColor = false;
    // selected filters segregated into their buckets
    const selectedBuckets = {
      assets_bucket: [],
      criminal_cases: [],
      party: [],
      gender: [],
      vote_share_bucket: [],
    };

    // that bucket name is set to true, one of whose filters is selected
    const finalBucketNames = {
      assets_bucket: false,
      criminal_cases: false,
      party: false,
      gender: false,
      vote_share_bucket: false,
    };

    if (appliedFilters.length == 0) {
      returnColor = true;
    } else {
      for (let i = 0; i < appliedFilters.length; i++) {
        const filter = appliedFilters[i];
        const filterBucketValue = bucketValues[filter];
        const filterBucketName = bucketNames[filter];
        selectedBuckets[filterBucketName].push(filterBucketValue);

        // chcking if the constituency's bucket values belong to the selectedBuckets
        // if so, the corresponding bucket name's vakue will be set to 'true' in finalBucketNames list, else 'false'
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
        if (
          selectedBuckets.party.includes("Other") &&
          (constituency["party"] == "IND" ||
            constituency["party"] == "HLP" ||
            constituency["party"] == "INLD")
        ) {
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
        // list of all the bucket names, to which at least one filter belongs
        const selectedBucketLabels = [];
        Object.keys(selectedBuckets).map((key) => {
          if (selectedBuckets[key].length != 0) selectedBucketLabels.push(key);
        });

        // if from all the selected buckets, even one doesnt satisfy the filer, the region will not be coloured
        const finalPointers = [];
        selectedBucketLabels.map((bucketName) => {
          if (finalBucketNames[bucketName]) finalPointers.push(true);
          else finalPointers.push(false);
        });

        if (finalPointers.includes(false)) returnColor = false;
        else returnColor = true;
      }
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

    region.attr("fill", newColor);
  });
};

// load the json data from the static files into two variables
d3.json(statePath).then((data, error) => {
  if (error) {
  } else {
    stateData = data.features;
    console.log("stateData : ", stateData);
    d3.json(educationPath).then((data, error) => {
      if (error) {
        console.log(error);
      } else {
        educationData = data;
        drawHRMap();
      }
    });
  }
});

// Set up an event listener for window resize
// resize map accordingly
window.addEventListener("resize", () => {
  const windowWidth = window.innerWidth;
  const scale = 0.073715248 * windowWidth + 71.79865206;
  const translateX = -(5.30223 * windowWidth + 5376.874);
  const translateY = -(2.10614 * windowWidth + 1871.39);
  g.selectAll("path").attr(
    "transform",
    `translate(${translateX},${translateY}) scale(${scale})`
  );

  if (windowWidth > 692) {
    navbarWrapper.style.visibility = "visible";
  }
  // else {
  //   navbarWrapper.style.visibility = "hidden";
  // }
});

const checkKeys = () => {
  const selected = (key) => {
    return clickTracking[key];
  };
  appliedFilters = allKeys.filter((key) => selected(key));
  updateMap();
};

const handleFilterSelection = (event) => {
  const currentId = event.target.id;
  const startsWith = "clicked";

  // check for the element's id
  // if it lacks the prefix 'clicked', append it at the beginning
  // update id
  if (currentId.includes(startsWith, 0)) {
    const idSufix = currentId.slice(7, currentId.length);
    const newId = idSufix.charAt(0).toLowerCase() + idSufix.slice(1);
    clickTracking[newId] = false;
    event.target.id = newId;
  } else {
    const newId =
      startsWith + currentId.charAt(0).toUpperCase() + currentId.slice(1);
    clickTracking[currentId] = true;
    event.target.id = newId;
  }
  checkKeys();
};

window.addEventListener("resize", () => {
  const windowWidth = window.innerWidth;

  if (windowWidth > 692) {
    navbarWrapper.style.visibility = "visible";
  }
});

menuBar.addEventListener("click", () => {
  if (navbarWrapper.style.visibility == "hidden") {
    navbarWrapper.style.visibility = "visible";
    console.log("set to visible");
  } else {
    navbarWrapper.style.visibility = "hidden";
    console.log("set to hidden");
  }
});

if (window.innerWidth > "692px") {
  navbarWrapper.addEventListener("click", () => {
    if (navbarWrapper.style.visibility == "visible") {
      navbarWrapper.style.visibility = "hidden";
      console.log("navbarWrapper - set to hidden");
    }
  });
}
