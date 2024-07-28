d3.csv("data.csv").then((data) => {
  const groupedData = d3.group(data, (d) => d.Duration);
  const durations = Array.from(groupedData.keys());
  let currentIndex = 0;

  function renderCharts(duration) {
    console.log(`Rendering charts for ${duration}`);

    d3.json("text.json").then((text) => {
      const teamName = duration;
      const paragraphText = text[duration];
      d3.select("#header").html(`<h1>${teamName}</h1><p>${paragraphText}</p>`);
    });

    const durationData = groupedData.get(duration);

    d3.select("#dashboard").html("");

    const margin = { top: 100, right: 50, bottom: 50, left: 50 };
    const chartWidth = 600 - margin.left - margin.right;
    const chartHeight = 400 - margin.top - margin.bottom;

    const mpChart = d3
      .select("#dashboard")
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom + 200)
      .attr("class", "chart")
      .style("margin-right", "20px")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    mpChart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text("Avg Minutes Played per Game");

    const xScaleMP = d3
      .scaleBand()
      .domain(durationData.map((d) => d.Season))
      .range([0, chartWidth])
      .padding(0.1);

    const yScaleMP = d3
      .scaleLinear()
      .domain([0, d3.max(durationData, (d) => d.MP)])
      .range([chartHeight, 0]);

    mpChart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScaleMP))
      .selectAll("text")
      .attr("class", "axis-label");

    mpChart
      .append("g")
      .call(d3.axisLeft(yScaleMP))
      .selectAll("text")
      .attr("class", "axis-label");

    mpChart
      .selectAll(".bar")
      .data(durationData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScaleMP(d.Season))
      .attr("y", (d) => yScaleMP(d.MP))
      .attr("width", xScaleMP.bandwidth())
      .attr("height", (d) => chartHeight - yScaleMP(d.MP))
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 0.9)
          .text(d.MP + " min/game");
      })
      .on("mouseout", function (d) {
        d3.select("#tooltip").style("opacity", 0);
      });

    const annotations = durationData
      .filter((d) => d.Championship == 1)
      .map((d) => ({
        note: {
          label: `NBA Champ`,
          title: d.Season,
          align: "left",
          wrap: 200,
        },
        x: xScaleMP(d.Season) + xScaleMP.bandwidth() / 2,
        y: chartHeight,
        dy: 100,
        dx: 20,
        color: "purple",
      }));

    mpChart
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScaleMP(40))
      .attr("y2", yScaleMP(40))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    const annotationsMax = durationData
      .filter((d) => d.MP > 40)
      .map((d) => ({
        note: {
          align: "middle",
          wrap: 200,
        },
        x: xScaleMP(d.Season) + xScaleMP.bandwidth() / 2,
        y: yScaleMP(d.MP),
        dy: -10,
        dx: 0,
        color: "red",
        type: d3.annotationCalloutCircle,
        subject: { radius: 10 },
      }));

    const makeAnnotationsChampionships = d3
      .annotation()
      .type(d3.annotationLabel)
      .annotations(annotations);

    const makeAnnotationsMax = d3
      .annotation()
      .type(d3.annotationLabel)
      .annotations(annotationsMax);

    mpChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotationsChampionships);
    mpChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotationsMax);

    const pctChart = d3
      .select("#dashboard")
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom + 200)
      .attr("class", "chart")
      .style("margin-right", "20px")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    pctChart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text("2-Point% and 3-Point% per Season");

    const xScalePct = d3
      .scaleBand()
      .domain(durationData.map((d) => d.Season))
      .range([0, chartWidth])
      .padding(0.1);

    const yScalePct = d3
      .scaleLinear()
      .domain([0, d3.max(durationData, (d) => Math.max(d["2P%"], d["3P%"]))])
      .range([chartHeight, 0]);

    pctChart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScalePct))
      .selectAll("text")
      .attr("class", "axis-label");

    pctChart
      .append("g")
      .call(d3.axisLeft(yScalePct))
      .selectAll("text")
      .attr("class", "axis-label");

    pctChart
      .selectAll(".bar2")
      .data(durationData)
      .enter()
      .append("rect")
      .attr("class", "bar2")
      .attr("x", (d) => xScalePct(d.Season))
      .attr("y", (d) => yScalePct(d["2P%"]))
      .attr("width", xScalePct.bandwidth() / 2)
      .attr("height", (d) => chartHeight - yScalePct(d["2P%"]))
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 0.9)
          .text(d["2P%"] + " 2P%");
      })
      .on("mouseout", function (d) {
        d3.select("#tooltip").style("opacity", 0);
      });

    pctChart
      .selectAll(".bar3")
      .data(durationData)
      .enter()
      .append("rect")
      .attr("class", "bar3")
      .attr("x", (d) => xScalePct(d.Season) + xScalePct.bandwidth() / 2)
      .attr("y", (d) => yScalePct(d["3P%"]))
      .attr("width", xScalePct.bandwidth() / 2)
      .attr("height", (d) => chartHeight - yScalePct(d["3P%"]))
      .on("mouseover", function (event, d) {
        d3.select("#tooltip")
          .style("left", event.pageX + 5 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("opacity", 0.9)
          .text(d["3P%"] + " 3P%");
      })
      .on("mouseout", function (d) {
        d3.select("#tooltip").style("opacity", 0);
      });

    pctChart
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScalePct(0.35))
      .attr("y2", yScalePct(0.35))
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    pctChart
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScalePct(0.55))
      .attr("y2", yScalePct(0.55))
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4");

    const annotations2P = durationData
      .filter((d) => d["2P%"] > 0.55)
      .map((d) => ({
        x: xScalePct(d.Season) + xScalePct.bandwidth() / 4,
        y: yScalePct(d["2P%"]),
        dy: -10,
        dx: 0,
        color: "black",
        type: d3.annotationCalloutCircle,
        subject: { radius: 10 },
      }));

    const makeAnnotations2P = d3
      .annotation()
      .type(d3.annotationLabel)
      .annotations(annotations2P);

    pctChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations2P);

    const annotationsPct = durationData
      .filter((d) => d.Championship == 1)
      .map((d) => ({
        note: {
          label: `NBA Champ`,
          title: d.Season,
          align: "left",
          wrap: 200,
        },
        x: xScalePct(d.Season) + xScalePct.bandwidth() / 2,
        y: chartHeight,
        dy: 100,
        dx: 20,
        color: "purple",
      }));

    const makeAnnotationsPct = d3
      .annotation()
      .type(d3.annotationLabel)
      .annotations(annotationsPct);

    const annotations3P = durationData
      .filter((d) => d["3P%"] > 0.35)
      .map((d) => ({
        x:
          xScalePct(d.Season) +
          xScalePct.bandwidth() / 2 +
          xScalePct.bandwidth() / 4,
        y: yScalePct(d["3P%"]),
        dy: -10,
        dx: 0,
        color: "black",
        type: d3.annotationCalloutCircle,
        subject: { radius: 10 },
      }));

    const makeAnnotations3P = d3
      .annotation()
      .type(d3.annotationLabel)
      .annotations(annotations3P);

    pctChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations3P);

    pctChart
      .append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotationsPct);

    const legendPct = pctChart
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${chartWidth - 20}, 20)`);

    legendPct
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "orange");

    legendPct.append("text").attr("x", 20).attr("y", 10).text("2P%");

    legendPct
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "green");

    legendPct.append("text").attr("x", 20).attr("y", 30).text("3P%");
  }

  renderCharts(durations[currentIndex]);

  d3.select("#next-team-button").on("click", () => {
    console.log("Next Team button clicked");
    currentIndex++;
    if (currentIndex < durations.length) {
      renderCharts(durations[currentIndex]);

      if (currentIndex === durations.length - 1) {
        d3.select("#next-team-button").text("View All Seasons");
      }
    } else {
      console.log("Showing final dashboard");
      d3.select("#dashboard").html("");
      d3.select("#next-team-button").style("display", "none");
      d3.select("#duration-select").style("display", "block");

      const select = d3
        .select("#duration-select")
        .style("display", "block")
        .text("Select a Duration: ");
      select
        .selectAll("option")
        .data(durations)
        .enter()
        .append("option")
        .attr("value", (d) => d)
        .text((d) => d)
        .property("selected", (d, i) => i === 0);

      renderCharts(select.property("value"));

      select.on("change", function () {
        const selectedDuration = d3.select(this).property("value");
        renderCharts(selectedDuration);
      });
    }
  });
});
