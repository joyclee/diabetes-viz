/**
 * Created with JetBrains PhpStorm.
 * User: jooskim
 * Date: 10/5/13
 * Time: 4:24 PM
 * To change this template use File | Settings | File Templates.
 */
require.config({
    paths: {
        'jquery': 'vendor/jquery/jquery',
        'D3': 'vendor/d3/d3.v3',
        'queue': 'vendor/d3/queue.v1.min',
        'moment': 'vendor/momentjs/moment.min',
        'bootstrap': 'vendor/bootstrap/bootstrap',
        'slider': 'slider/js/bootstrap-slider'
    },
    shim: {
        'D3': {
            exports: 'd3'
        },
        'queue': {
            exports: 'queue'
        },
        'moment': 'moment',
        'bootstrap': {
            deps: ['jquery']
        },
        'slider': {
            deps: ['jquery']
        }
    }
});


define(['jquery','D3','queue','moment','slider'], function($, d3, queue, moment){
    var raw = [];
    var structured = [];
    var maximumBG = 420;
    var weeksToDisplay = 4;
    var svgWidth = 900;
    var svgHeight = 180;
    var svgPadding = 20;

    // debug
    var mode = 2; // 0 for scatter plot, 1 for heatmap, 2 for shape
    var showValue = 1;

    /*
    data structure is something like below:
    {
        "week": 1,
        "monday": [
            {"date": "10/12/2013"},
            {"BG": [{"time": "12:33:00 AM", "level": 221.0}, ... ] },
            {"insulin": }
        ],
         "tuesday": [
         {"date": "10/13/2013"},
         {"BG": [{"time": "12:33:00 AM", "level": 221.0}, ... ] },
         {"insulin": }
         ],
         ...

    */

    queue()
        .defer(function(i, callback){
            d3.json("bg/2013-07-01/2013-09-16/", function(d){
                d.forEach(function(data){
                    raw.push(data);
                });
                callback(null,i);
            })
        }, 'bg')
        .await(run);

    function structureData(){
        //console.log(raw);
        var datesAggregated = [];

        raw.forEach(function(data){
            datesAggregated.push(moment(data.createdDate).valueOf());
        });

        // total number of weeks
        var totWeeks = moment(d3.max(datesAggregated)).week();
        for(var i=0; i<totWeeks - moment(d3.min(datesAggregated)).week() + 1; i++){
            var tempLevels = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]]];
            var tempTimes = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]]];
            var tempDates = [['sun',[]],['mon',[]],['tue',[]],['wed',[]],['thu',[]],['fri',[]],['sat',[]]];
            raw.forEach(function(data){
                if(moment(data.createdDate).week()-(moment(d3.min(datesAggregated)).week()) == i){
                    if(moment(data.createdDate).day() == 0){
                        tempLevels[0][1].push(data.level);
                        tempTimes[0][1].push(data.createdTime);
                        tempDates[0][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 1){
                        tempLevels[1][1].push(data.level);
                        tempTimes[1][1].push(data.createdTime);
                        tempDates[1][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 2){
                        tempLevels[2][1].push(data.level);
                        tempTimes[2][1].push(data.createdTime);
                        tempDates[2][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 3){
                        tempLevels[3][1].push(data.level);
                        tempTimes[3][1].push(data.createdTime);
                        tempDates[3][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 4){
                        tempLevels[4][1].push(data.level);
                        tempTimes[4][1].push(data.createdTime);
                        tempDates[4][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 5){
                        tempLevels[5][1].push(data.level);
                        tempTimes[5][1].push(data.createdTime);
                        tempDates[5][1].push(data.createdDate);
                    }else if(moment(data.createdDate).day() == 6){
                        tempLevels[6][1].push(data.level);
                        tempTimes[6][1].push(data.createdTime);
                        tempDates[6][1].push(data.createdDate);
                    }
                }
            });
            structured.push({
                'week': i+1,
                'sunday': {'dates': tempDates[0][1], 'times': tempTimes[0][1], 'levels': tempLevels[0][1], 'count': tempDates[0][1].length},
                'monday': {'dates': tempDates[1][1], 'times': tempTimes[1][1], 'levels': tempLevels[1][1], 'count': tempDates[1][1].length},
                'tuesday': {'dates': tempDates[2][1], 'times': tempTimes[2][1], 'levels': tempLevels[2][1], 'count': tempDates[2][1].length},
                'wednesday': {'dates': tempDates[3][1], 'times': tempTimes[3][1], 'levels': tempLevels[3][1], 'count': tempDates[3][1].length},
                'thursday': {'dates': tempDates[4][1], 'times': tempTimes[4][1], 'levels': tempLevels[4][1], 'count': tempDates[4][1].length},
                'friday': {'dates': tempDates[5][1], 'times': tempTimes[5][1], 'levels': tempLevels[5][1], 'count': tempDates[5][1].length},
                'saturday': {'dates': tempDates[6][1], 'times': tempTimes[6][1], 'levels': tempLevels[6][1], 'count': tempDates[6][1].length}});
        }


    }

    var catColors = d3.scale.category10(); // color function

    // shape mode
    function drawShapeCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of weeks to be displayed
        if(mode == 0){
            svg.style({'height': svgHeight*numOfWeeks + 'px' });
        }else if(mode == 1 || mode == 2){
            svg.style({'height': svgHeight + 'px' });
        }


        svg.append('text')
            .text(function(){ var map=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]; return map[svg.attr('id')];})
            .attr({x: svgPadding*1-10, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25})
            .style({'fill':'#666666', 'stroke-width':0});

        for(var i=0; i<numOfWeeks; i++){
            svg.append('rect')
                .attr({x: svgPadding*8, y: svgPadding-10 + i * 39, width: svgWidth-10*svgPadding, height: 29 })
                .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'});

            for(var j=0; j<23; j++){
                svg.append('rect')
                    .attr({x: svgPadding*8 + (svgWidth-10*svgPadding)/24 * j, y: svgPadding-10 + i * 39, width: (svgWidth-10*svgPadding)/24, height: 29 })
                    .style({'stroke': '#ddd', 'stroke-width': 0, 'fill': 'none'})
            }

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("06:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("09:00 AM", "2013-08-10") - scaleTimeHeatmap("06:00 AM", "2013-08-10"), "class": "breakfastBracket", "height": 147})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("11:00 AM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("02:00 PM", "2013-08-10") - scaleTimeHeatmap("11:00 AM", "2013-08-10"), "class": "lunchBracket", "height": 147})
                .style({"fill": "#eeeeee"});

            svg.append('rect')
                .attr({x: scaleTimeHeatmap("05:00 PM", "2013-08-10"), y: svgPadding-10, width: scaleTimeHeatmap("08:00 PM", "2013-08-10") - scaleTimeHeatmap("05:00 PM", "2013-08-10"), "class": "dinnerBracket", "height": 147})
                .style({"fill": "#eeeeee"});

        }

        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];


        svg.selectAll('text.time').data(ticksTime).enter().append('text')
            .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
            .attr({'x': function(d,i){ return svgPadding*8+(svgWidth-10*svgPadding)/24*(i)*3-12; }, 'y': svgHeight - svgPadding*2 + 30, 'font-size': '9px', 'class': 'time'});
    }

    function drawShape(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        for(var j=0; j<numOfWeeks; j++){
            var testDrive = eval('structured[j].'+day);
            var oneDate = new Array(testDrive.dates[0]);

            svg.selectAll('rect.weekIndicator'+j).data(oneDate).enter().append('rect')
                .attr({'x': svgPadding*3+10, 'y': 10 + j*39, 'width': 5, 'height': 29, 'class': 'weekIndicator'+j})
                .style({'fill': function(d){ if(d != undefined){ return catColors(j)}else{ return '#ffffff';}}});
            svg.selectAll('text.monthIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+24, 'y': 30 + j*39, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 14, 'class': 'monthIndicator'+j})
                .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM') }else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});
            svg.selectAll('text.dayIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+55, 'y': 30 + j*39, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 14, 'class': 'dayIndicator'+j})
                .text(function(d,i){ if(d != undefined){ return moment(d).format('DD') }else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});

            svg.append('g').attr({'class': 'testGraph'+j});
            svg.select('g.testGraph'+j).selectAll('g').data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup'});
            svg.select('g.testGraph'+j).selectAll('.elementGroup').data(testDrive.levels).append('path')
                .attr({
                    'd': function(d,i){
                        var dPath = 'M '+parseInt(scaleTimeHeatmap(testDrive.times[i], testDrive.dates[0])-((svgWidth-10*svgPadding)/24/2))+' '+parseInt(svgPadding-10 + j*39);
                        if(d>180){ // draw circle
                            dPath += ' m 0, 14.5 a 14.5,14.5 0 1, 0 29, 0 a 14.5,14.5 0 1,0 -29,0';
                        }else if(d<=180 && d>70){
                            dPath += ' m 0, 14.5 a 14.5,14.5 0 1, 0 29, 0 a 14.5,14.5 0 1,0 -29,0'; // m 14.5, 29 l 14.5 0 l 0 -29 l -29 0 l 0 29 l 14.5 0';
                        }else{
                            dPath += ' m 14.5, 0 l -14.5 29 l 29 0 l -14.5 -29';
                        }
                        return dPath;},
                    'id': function(d,i){
                        return i;}
                })
                .attr({"stroke-dasharray":function(d,i){ if(d<=180 && d>70){ return "5,5" }else{ return ""} }})
                .style({'fill': function(d,i){ if(d>180){ return "rgba(200,200,200,0.8)"; }else{ return "#ffffff"}}})
                .style({'stroke': 'rgba(180,180,180,0.8)', 'stroke-width': 1 });

            if(showValue == 1){
                svg.select('g.testGraph'+j).selectAll('.elementGroup').data(testDrive.levels).append('text')
                    .attr({'x': function(d,i){ return scaleTimeHeatmap(testDrive.times[i], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 3;}, 'y': svgPadding+ 10 + j*39, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue'})
                    .text(function(d,i){ return d;})
                    .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});
            }
        }

        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){

            d3.select(this).select('.BGValue').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
            d3.select(this).select('.BGValue').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });
    }

    // heatmap mode
    function drawHeatmapCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of weeks to be displayed
        if(mode == 0){
            svg.style({'height': svgHeight*numOfWeeks + 'px' });
        }else if(mode == 1){
            svg.style({'height': svgHeight + 'px' });
        }


        svg.append('text')
            .text(function(){ var map=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]; return map[svg.attr('id')];})
            .attr({x: svgPadding*1-10, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25})
            .style({'fill':'#666666', 'stroke-width':0});

        for(var i=0; i<numOfWeeks; i++){
            svg.append('rect')
                .attr({x: svgPadding*8, y: svgPadding-10 + i * 29, width: svgWidth-10*svgPadding, height: 29 })
                .style({'stroke': '#ddd', 'stroke-width': 1, 'fill': 'none'});

            for(var j=0; j<23; j++){
                svg.append('rect')
                    .attr({x: svgPadding*8 + (svgWidth-10*svgPadding)/24 * j, y: svgPadding-10 + i * 29, width: (svgWidth-10*svgPadding)/24, height: 29 })
                    .style({'stroke': '#ddd', 'stroke-width': 1, 'fill': 'none'})
            }

        }

        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];


        svg.selectAll('text.time').data(ticksTime).enter().append('text')
            .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
            .attr({'x': function(d,i){ return svgPadding*8+(svgWidth-10*svgPadding)/24*(i)*3-12; }, 'y': svgHeight - svgPadding*2, 'font-size': '9px', 'class': 'time'});

    }

    function drawHeatmap(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        for(var j=0; j<numOfWeeks; j++){
            var testDrive = eval('structured[j].'+day);
            var oneDate = new Array(testDrive.dates[0]);

            svg.selectAll('rect.weekIndicator'+j).data(oneDate).enter().append('rect')
                .attr({'x': svgPadding*3+10, 'y': 10 + j*29, 'width': 5, 'height': 29, 'class': 'weekIndicator'+j})
                .style({'fill': function(d){ if(d != undefined){ return catColors(j)}else{ return '#ffffff';}}});
            svg.selectAll('text.monthIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+24, 'y': 30 + j*29, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 14, 'class': 'monthIndicator'+j})
                .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM') }else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});
            svg.selectAll('text.dayIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+55, 'y': 30 + j*29, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 14, 'class': 'dayIndicator'+j})
                .text(function(d,i){ if(d != undefined){ return moment(d).format('DD') }else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});

            svg.append('g').attr({'class': 'testGraph'+j});
            svg.select('g.testGraph'+j).selectAll('g').data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup'});
            svg.select('g.testGraph'+j).selectAll('.elementGroup').data(testDrive.levels).append('circle')
                .attr({'cx': function(d,i){ console.log(scaleTimeHeatmap(testDrive.times[i], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2); return scaleTimeHeatmap(testDrive.times[i], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2;}, 'cy': svgPadding-10 + j*29, 'r': (svgWidth-10*svgPadding)/36, 'id': function(d,i){ return i;}})
                .style({'stroke': 'none', 'fill-opacity': 0.65, 'fill': function(d,i){
                    var h=0;
                    var s=0;
                    var l=0;

                    if(d>180){
                        var sRangeFunc = d3.scale.linear().domain([121, maximumBG]).range([0, 100]);
                        var lRangeFunc = d3.scale.pow().domain([121, maximumBG]).range([63, 55]);

                        if(d>maximumBG){
                            s=100;
                            l=100;
                        }else{
                            s=sRangeFunc(d);
                            l=lRangeFunc(d);
                        }
                    }else if(d<=180 && d>70){
                        s=0;
                        l=60;
                    }else{
                        h=224;
                        var sRangeFunc = d3.scale.linear().domain([0, 120]).range([100,0]);
                        var lRangeFunc = d3.scale.linear().domain([0, 120]).range([36,63])
                        s=sRangeFunc(d);
                        l=lRangeFunc(d);
                    }
                    return 'hsl('+h+','+s+'%,'+l+'%)';
                }
                });

            if(showValue == 1){
                svg.select('g.testGraph'+j).selectAll('.elementGroup').data(testDrive.levels).append('text')
                    .attr({'x': function(d,i){ return scaleTimeHeatmap(testDrive.times[i], testDrive.dates[0])-(svgWidth-10*svgPadding)/24/2 + 3;}, 'y': svgPadding+ 10 + j*29, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue'})
                    .text(function(d,i){ return d;})
                    .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});
            }

        }

        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){
//            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
//            console.log(d3.select(textElement)[0][0]);

            d3.select(this).select('.BGValue').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
            d3.select(this).select('.BGValue').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });

    }

    // scatter plot mode
    function scaleBG(item, array){
        var BGValues = [];
        array.forEach(function(data){
            BGValues.push(parseFloat(data.level));
        });
//        var rangeFunc = d3.scale.linear().domain([0, d3.max(BGValues)]).range([svgHeight - svgPadding, svgPadding]);
        var rangeFunc = d3.scale.linear().domain([0, maximumBG]).range([svgHeight - svgPadding, svgPadding]); // fixed maximum BG
        return rangeFunc(item);
    }

    function scaleTime(item, date){
        date = date.replace(/\b-\b/g, "/");
        var beginning = moment(date + " 12:00:00 AM").valueOf();
        var ending = beginning + 86400000;
        var rangeFunc = d3.scale.linear().domain([beginning, ending]).range([svgPadding*8, svgWidth - svgPadding]);
        return rangeFunc(moment(date+' '+item).valueOf());
    }

    function scaleTimeHeatmap(item, date){
        date = date.replace(/\b-\b/g, "/");
        var beginning = moment(date + " 12:00:00 AM").valueOf();
        var ending = beginning + 86400000;
        var rangeFunc = d3.scale.linear().domain([beginning, ending]).range([svgPadding*8, svgWidth - svgPadding*3]);
        return rangeFunc(moment(date+' '+item).valueOf());
    }

    function drawScatterCanvas(svg, id, numOfWeeks){
        if(!numOfWeeks){
            numOfWeeks = 1;
        }
        // expands the svg height according to the # of weeks to be displayed
        svg.style({'height': svgHeight*numOfWeeks + 'px' });

        svg.append('text')
            .text(function(){ var map=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"]; return map[svg.attr('id')];})
            .attr({x: svgPadding*1-10, y: svgPadding-35, 'transform': 'rotate(90)', 'font-size': 25})
            .style({'fill':'#666666', 'stroke-width':0});

        for(var i=0; i<numOfWeeks; i++){
            svg.append('line')
                .attr({x1: svgPadding*8, x2: svgWidth - svgPadding, y1: svgHeight - svgPadding + i * svgHeight, y2: svgHeight - svgPadding + i * svgHeight })
                .style({'stroke': '#999', 'stroke-width': 1});
            svg.append('line')
                .attr({x1: svgPadding*8, x2: svgPadding*8, y1: svgHeight - svgPadding + i * svgHeight, y2: svgPadding + i * svgHeight })
                .style({'stroke': '#999', 'stroke-width': 1});
        }

        // draw ticks
        var ticksBG = [0, 50, 100, 150, 200, 250, 300, 350];
        var ticksTime = ["12:00 AM","3:00 AM","6:00 AM","9:00 AM","12:00 PM","3:00 PM","6:00 PM","9:00 PM","11:59 PM"];

        for(var j=0; j<numOfWeeks; j++){
            svg.selectAll('text.BG'+j).data(ticksBG).enter().append('text')
                .text(function(d){ return d; })
                .attr({'x': svgPadding*7, 'y': function(d,i){ return svgHeight*j + scaleBG(d, raw) + 3;}, 'font-size': '9px', 'class': 'BG'+j})

            svg.selectAll('line.ticksBG'+j).data(ticksBG).enter().append('line')
                .attr({'x1': svgPadding*8+'px', 'x2': svgPadding*8 + 3+'px', 'y1': function(d,i){ return scaleBG(d, raw) + j*svgHeight;}, 'y2': function(d,i){ return scaleBG(d, raw)+j*svgHeight;}, 'class': 'ticksBG'+j})
                .style({'stroke-width': '1px', 'stroke': '#999'});


            svg.selectAll('line.ticksTime'+j).data(ticksTime).enter().append('line')
                .attr({'x1': function(d,i){ return scaleTime(d, "2013/01/01")+'px';}, 'x2': function(d,i){ return scaleTime(d, "2013/01/01")+'px';}, 'y1': svgHeight - svgPadding + svgHeight*j, 'y2': svgHeight - svgPadding - 3 + j*svgHeight, 'class': 'ticksTime'+j })
                .style({'stroke-width': '1px', 'stroke': '#999'});

            svg.selectAll('text.time'+j).data(ticksTime).enter().append('text')
                .text(function(d,i){ if(i != 8){ return moment('2013/01/01 '+d).format('h A');}else{ return (moment('2013/01/01 '+d).hour()+1)/2+ ' AM'; } })
                .attr({'x': function(d,i){ return scaleTime(d, "2013/01/01") - 14+'px'; }, 'y': svgHeight - svgPadding + 15 + j*svgHeight, 'font-size': '9px', 'class': 'time'+j});
        }


        // draw the normal range
        for(var j=0; j<numOfWeeks; j++){
            svg.append('rect')
                .attr({'x': svgPadding*8, 'y': scaleBG(120, raw)+j*svgHeight, 'width': svgWidth - svgPadding*9, 'height': parseFloat(scaleBG(70, raw) - scaleBG(120,raw))})
                .style({'fill': 'rgba(200,200,200,0.5)'});
        }
    }

    function drawScatter(svg, numOfWeeks, day){
        if(numOfWeeks == undefined){
            numOfWeeks = 1;
        }

        for(var j=0; j<numOfWeeks; j++){
            var testDrive = eval('structured[j].'+day);
            var oneDate = new Array(testDrive.dates[0]);

            svg.selectAll('rect.weekIndicator'+j).data(oneDate).enter().append('rect')
                .attr({'x': svgPadding*3+20, 'y': 8 + j*svgHeight, 'width': 35, 'height': 5, 'class': 'weekIndicator'+j})
                .style({'fill': function(d){ if(d != undefined){ return catColors(j)}else{ return '#ffffff';}}});

            svg.selectAll('text.monthIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+24, 'y': 30 + j*svgHeight, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 14, 'class': 'monthIndicator'+j})
                .text(function(d,i){ if(d != undefined){ return moment(d).format('MMM');}else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});
            svg.selectAll('text.dayIndicator'+j).data(oneDate).enter().append('text')
                .attr({'x': svgPadding*3+25, 'y': 50 + j*svgHeight, 'width': svgPadding*2, 'height': svgPadding*2, 'font-size': 20, 'class': 'dayIndicator'+j })
                .text(function(d,i){ if(d != undefined){ return moment(d).format('DD');}else{ return null;}})
                .style({'fill': '#999999', 'stroke-width': 0});

            svg.append('g').attr({'class': 'testGraph'+j});
            svg.select('g.testGraph'+j).selectAll('g').data(testDrive.levels).enter().append('g')
                .attr({'class': 'elementGroup'});
            svg.select('g.testGraph'+j).selectAll('g.elementGroup').data(testDrive.levels).append('circle')
                .attr({'r': 4, 'cx': function(d,i){ return scaleTime(testDrive.times[i], testDrive.dates[0]);}, 'cy': function(d,i){ return svgHeight*j + scaleBG(testDrive.levels[i], raw)}})
                .style({'stroke': 'none', 'fill': 'rgba(30,30,30,0.5)'});

            if(showValue == 1){
                svg.select('g.testGraph'+j).selectAll('g.elementGroup').data(testDrive.levels).append('text')
                    .attr({'x': function(d,i){ return scaleTime(testDrive.times[i], testDrive.dates[0]) - 10;}, 'y': function(d,i){return svgHeight*j + scaleBG(testDrive.levels[i], raw) + 15}, 'font-size': 9, 'id': function(d,i){ return i;}, 'class': 'BGValue'})
                    .text(function(d,i){ return d;})
                    .style({'fill': '#000000', 'stroke-width': 0, 'stroke': '#000000'});
            }
        }


        svg.selectAll('.elementGroup').on('mouseover', function(d,i){ // svg.selectAll('g rect').on('mouseover', function(d,i){
//            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
//            console.log(d3.select(textElement)[0][0]);

            d3.select(this).select('.BGValue').transition().attr({'font-size': 20}); // 'y': parseInt(d3.select(textElement)[0][0].attr('y')) - 20,
        });

        svg.selectAll('.elementGroup').on('mouseout', function(d,i){
            var textElement = $(this).parent().find('.BGValue[id='+$(this).attr('id')+']');
            d3.select(this).select('.BGValue').transition().attr({ 'font-size': 9}); //'y': parseInt(d3.select(textElement)[0][0].attr('y')) + 20,
        });
    }

    function run(){
        if(mode == 0){
            var drawCanvas = drawScatterCanvas;
            var draw = drawScatter;
        }else if(mode == 1){
            var drawCanvas = drawHeatmapCanvas;
            var draw = drawHeatmap;
        }else if(mode == 2){
            var drawCanvas = drawShapeCanvas;
            var draw = drawShape;
        }

        $('.slider').slider({'tooltip': 'show'})
            .on('slideStop', function(e){
                weeksToDisplay = $(this).val();
                $('svg,hr').remove();
                for(var i=0; i<7; i++){
                    svgs[i] = d3.select('.vizElement').append('svg').style({'width': svgWidth+'px', 'height': svgHeight+'px' }).attr({'id': i});
                }

                $('svg').after("<hr>");

                for(var i=0; i<7; i++){
                    drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
                    draw(svgs[i], weeksToDisplay, map[i]);
                }
//                console.log($(this).val());
            });

        $('div.spinner').hide();
        structureData();

        var svgs = [];
        var map = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        for(var i=0; i<7; i++){
            svgs[i] = d3.select('.vizElement').append('svg').style({'width': svgWidth+'px', 'height': svgHeight+'px' }).attr({'id': i});
        }

        $('svg').after("<hr>");

        for(var i=0; i<7; i++){

//            drawScatterCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
            drawCanvas(svgs[i], $(svgs[i]).attr('id'), weeksToDisplay);
//            drawScatter(svgs[i], weeksToDisplay, map[i]);
            draw(svgs[i], weeksToDisplay, map[i]);
        }

        console.log(structured);


    }

});