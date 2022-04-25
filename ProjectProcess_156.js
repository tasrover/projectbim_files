var viewer3D1;
var app;
var loop;
var workData = gantt_1;
var selected_column = null;
var resizeEvent = new Event('resize');
var fullView = { "name": "persp", "position": { "x": 170419.7510529541, "y": 99303.21146884476, "z": 13425.755432513995 }, "target": { "x": 169954.50537857827, "y": 190331.99413933844, "z": 15293.460756786912 }, "up": { "x": 0.00010484061703380124, "y": -0.020512891592180275, "z": 0.9997895830058305 }, "near": 33301.13036052317, "far": 52868.65461022091, "zoom": 1, "version": 1, "fov": 45, "aspect": 4.022687609075043, "coordinateSystem": "world" }
var homeView = { "name": "persp", "position": { "x": 116612.94844548733, "y": 89807.75793027601, "z": 66792.23640107838 }, "target": { "x": 169180.18758413, "y": 142375.00007080057, "z": 14224.999030511523 }, "up": { "x": 0, "y": -4.371139707474003e-8, "z": 0.999999999999999 }, "near": 55780.40924595436, "far": 126317.84749426962, "zoom": 1, "version": 1, "fov": 45, "aspect": 1.5724258289703317, "coordinateSystem": "world" }
    // 初始化显示组件
BimfaceLoaderConfig = new BimfaceSDKLoaderConfig();
BimfaceLoaderConfig.viewToken = viewToken1;
BimfaceSDKLoader.load(BimfaceLoaderConfig, onSDKLoadSucceeded);

function onSDKLoadSucceeded(viewMetaData) {
    // 加载计划模型
    var WebAppConfig = new Glodon.Bimface.Application.WebApplication3DConfig();
    view1 = WebAppConfig.domElement = document.getElementById('domId1')
    WebAppConfig.viewToken = viewMetaData.viewToken;
            WebAppConfig.backgroundColor = [
        {
          color: new Glodon.Web.Graphics.Color("rgba(0,0,0,0)"),
        },
      ];
    planned = new Glodon.Bimface.Application.WebApplication3D(WebAppConfig);
    planned.addView(viewMetaData.viewToken);
    
    viewer3D1 = planned.getViewer();
    viewer3D1.addEventListener(Glodon.Bimface.Viewer.Viewer3DEvent.ViewLoading, function() {
        $(".bf-loading .bf-loading-gif").css({
            'background-image': 'url("/static/img/loading.gif")',
            'width': '32px',
            'height': '32px',
            'margin': '0 auto',
        });
    });
    planned.addEventListener('ViewAdded', function() {
        $(".bf-toolbar").hide();
        modelOverride(viewer3D1);
        GanttClickEvents(new Date())
        selected_column = getMonday(new Date())
        gantt.render()

    })
}


function modelOverride(model) {
    color = new Glodon.Web.Graphics.Color("#969696", 0.4);
    model.getModel().overrideAllComponentsColor(color);

}

function switchFn() {
    var checkBox = document.getElementById("switch");
    var Gantt = document.getElementById("GanttContainer");
    var Curve = document.getElementById("CurveContainer");
    var playButton = document.getElementById("playChart");

    if (checkBox.innerText == '进度计划') {
        Curve.style.display = "block";
        Gantt.style.display = "none";
        checkBox.innerText = '资源曲线';
        playButton.style.display = 'none'
    } else {
        Gantt.style.display = "block";
        Curve.style.display = "none";
        checkBox.innerText = '进度计划'
        playButton.style.display = 'block'
    }
}

//获取当前周数
function getWeekNumber(time) {
    var d = new Date(Date.UTC(time.getFullYear(), time.getMonth(), time.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

Date.prototype.format = function(fmt) { //
    var o = {
        'M+': this.getMonth() + 1, // 月份
        'd+': this.getDate(), // 日
        'H+': this.getHours(), // 小时
        'm+': this.getMinutes(), // 分
        's+': this.getSeconds(), // 秒
        'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
        'S': this.getMilliseconds()
            // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '')
            .substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) :
                (('00' + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

//计划模型展示
function modelPresents(planned_id) {
    //给指定模型的所有构件着色
    viewer3D1.getModel().overrideAllComponentsColor(color);
    viewer3D1.restoreComponentsColorById(planned_id);
    //  //根据Id修改构件透明度
    viewer3D1.render();

}

//高亮每周完成的构建
function weekHighLight(week_planned_id, week_finished_id) {
    //actual.setCameraAnimation(true)
    // viewer3D1.clearSelectedComponents();
    // viewer3D1.setSelectedComponentsById(week_planned_id);
    viewer3D1.clearSelectedComponents();
    viewer3D1.setSelectedComponentsById(week_finished_id);
    //actual.zoomToSelectedComponents();
    viewer3D1.render();
    // viewer3D2.render();

}

//给日期增加天数的方法
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
}


//甘特图

function GanttChart() {


    //时间轴点击事件
    gantt.attachEvent("onScaleClick", function(e, date) {
        clearInterval(loop)
        selected_column = date;
        var pos = gantt.getScrollState();
        gantt.render();
        gantt.scrollTo(pos.x, pos.y);
        GanttClickEvents(date)
    });

    function is_selected_column(column_date) {
        if (selected_column && column_date.valueOf() == selected_column.valueOf()) {
            return true;
        }
        return false;
    }
    gantt.templates.scale_cell_class = function(date) {
        if (is_selected_column(date))
            return "highlighted-column";
    };
    gantt.templates.timeline_cell_class = function(item, date) {
        if (is_selected_column(date))
            return "highlighted-column";
    };

    //自定义甘特图左侧栏
    var green = 0;
    var red = 0;
    var grey = 0;
    var yellow = 0;
    gantt.config.autofit = false;
    gantt.config.touch = "force";
    gantt.config.grid_width = 800;
    gantt.config.date_format = "%Y-%m-%d";
    //自定义左侧任务栏内容
    gantt.config.columns = [
        { name: "text", label: "任务名称", tree: true, width: '200' },

        {
            name: "start_date",
            label: "计划开始日期",
            align: "center",
            width: 100,
            template: function(item) {
                return item.start_date;
            }
        },
        {
            name: "end_date",
            label: "计划结束日期",
            align: "center",
            width: 100,
            template: function(item) {
                return item.end_date;
            }
        },
        {
            name: "actual_end_date",
            label: "实际结束日期",
            align: "center",
            width: 100

        },
        {
            name: "status",
            label: "状态",
            align: "left",
            width: 100,
            template: function(item) { //根据计划完成时间以及当前时间判断任务完成状态
                var end_date_new = new Date(item.end_date.valueOf())
                end_date_new = end_date_new.addDays(1)
                if (item.actual_end_date == '') {
                    var gap = ((new Date() - end_date_new) / (1000 * 60 * 60 * 24)) //计算延期时间用来判断红灯还是黄灯
                    if (new Date() > end_date_new && item.start_date <= new Date()) {
                        if (gap >= 10) {
                            return "<img class = '#660000' src = '/static/img/red.png'>延期施工</img>"
                        } else {
                            return "<img class = '#BF9000' src = '/static/img/yellow.png'>延期施工</img>"
                        }
                    } else if (new Date() <= end_date_new && item.start_date <= new Date()) {

                        return "<img  class = '#006600' src = '/static/img/green.png'>正常施工</img>";
                    } else if (item.start_date > new Date()) {
                        return "<img class = '#969696' src = '/static/img/grey.png'>未开工</img>";
                    }
                } else {
                    var gap = ((new Date(item.actual_end_date) - end_date_new) / (1000 * 60 * 60 * 24))
                    if (new Date(item.actual_end_date) > end_date_new && end_date_new <= new Date()) {
                        if (gap >= 10) {
                            return "<img class = '#660000' src = '/static/img/red.png'>完工</img>"
                        } else {
                            return "<img class = '#BF9000' src = '/static/img/yellow.png'>完工</img>"
                        }
                    } else if (new Date(item.actual_end_date) <= end_date_new) {
                        return "<img class = '#006600' src = '/static/img/green.png'>完工</img>";
                    } else if (item.start_date > new Date()) {
                        return "<img class = '#969696' src = '/static/img/grey.png'>未开工</img>";
                    }
                }

            }
        },
    ];

    //左侧任务栏点击事件
    gantt.attachEvent('onTaskClick', function(id, e) {
        clearInterval(loop)
        var childs_3 = []
        var task = gantt.getTask(id);
        viewer3D1.getModel().overrideAllComponentsColor(color);
        // viewer3D1.getModel().overrideAllComponentsColor(color);
        viewer3D1.clearSelectedComponents();
        // viewer3D1.clearSelectedComponents();
        if (task.$level == 2) { //第三级节点可直接显示
            Gantt_grid_click(id)
        } else if (task.$level == 1) { //第二级节点需要显示其下的所有子节点
            childs_3 = gantt.getChildren(id);
            for (var i = 0; i < childs_3.length; i++) {
                Gantt_grid_click(childs_3[i]);
            }
        } else { //第一级节点要先得到所有二级节点然后再得到所有三级节点
            var childs_2 = gantt.getChildren(id);
            for (var i = 0; i < childs_2.length; i++) {
                childs_3.push.apply(childs_3, gantt.getChildren(childs_2[i]))
            }
            for (var i = 0; i < childs_3.length; i++) {
                Gantt_grid_click(childs_3[i]);
            }
        }
    })

    //滚轮缩放
    gantt.config.scales = [
        // { unit: "week", step: 1, format: "%Y" + "年" + " " + " %m" + "月" + " " + "第" + "%w" + "周" },

        { unit: "week", step: 1, format: "%Y" + "-" + "%m" + " " + "第" + "%w" + "周" },

    ];

    gantt.attachEvent("onTaskDblClick", function(id, e) { // 禁用任务栏双击事件
        return false;
    });

    gantt.config.drag_progress = false; //禁用进度拖拽
    gantt.config.drag_links = false; //禁用链接拖拽
    gantt.config.drag_move = false; //禁用任务拖拽
    gantt.config.min_column_width = 90;
    gantt.init("GanttContainer");
    gantt.parse({
        data: gantt_1,
    });

    // 底部状态统计栏，数据显示
    $(function() {
        for (var i = 0; i < gantt_1.length; i++) {
            var end_date_new = new Date(gantt_1[i].end_date.valueOf())
                end_date_new = end_date_new.addDays(1)
            if (gantt_1[i].actual_end_date == '') {
                var gap = ((new Date() - end_date_new) / (1000 * 60 * 60 * 24)) //计算延期时间用来判断红灯还
                if (new Date() > end_date_new && new Date(gantt_1[i].start_date) <= new Date()) {
                    if (gap >= 10) {
                        if (gantt_1[i].level == 2) { red++ }
                    } else {
                        if (gantt_1[i].level == 2) { yellow++ }
                    }
                } else if (new Date() <= end_date_new && new Date(gantt_1[i].start_date) <= new Date()) {
                    if (gantt_1[i].level == 2) { green++ }
                } else if (new Date(gantt_1[i].start_date) > new Date()) {
                    if (gantt_1[i].level == 2) { grey++ }
                }
            } else {
                var gap = ((new Date(gantt_1[i].actual_end_date) - end_date_new) / (1000 * 60 * 60 * 24))
                if (new Date(gantt_1[i].actual_end_date) > end_date_new && end_date_new <= new Date()) {
                    if (gap >= 10) {
                        if (gantt_1[i].level == 2) { red++ }
                    } else {
                        if (gantt_1[i].level == 2) { yellow++ }
                    }
                } else if (new Date(gantt_1[i].actual_end_date) <= end_date_new && new Date(gantt_1[i].start_date) <= new Date()) {
                    if (gantt_1[i].level == 2) { green++ }
                } else if (new Date(gantt_1[i].start_date) > new Date()) {
                    if (gantt_1[i].level == 2) { grey++ }
                }
            }

        }
        // 设置每种颜色的灯百分比
        if (green + yellow + red + grey == 0) {
            var greenPencent = 0;
            var yellowPencent = 0;
            var redPencent = 0;
            var greyPencent = 0;
        } else {
            var greenPencent = ((green / (green + yellow + red + grey)) * 100).toFixed(0)
            var yellowPencent = ((yellow / (green + yellow + red + grey)) * 100).toFixed(0)
            var redPencent = ((red / (green + yellow + red + grey)) * 100).toFixed(0)
            var greyPencent = ((grey / (green + yellow + red + grey)) * 100).toFixed(0)
        }
        var one_percent = Number(greenPencent) + Number(yellowPencent) + Number(redPencent) + Number(greyPencent) - 100
        var max = Math.max(greenPencent, yellowPencent, redPencent, greyPencent)
        if (greenPencent == max) {
            greenPencent = greenPencent - one_percent
        } else if (yellowPencent == max) {
            yellowPencent = yellowPencent - one_percent
        } else if (redPencent == max) {
            redPencent = redPencent - one_percent
        } else if (greyPencent == max) {
            greyPencent = greyPencent - one_percent
        }
        $('#green').html(greenPencent + '%');
        $('#yellow').html(yellowPencent + '%');
        $('#red').html(redPencent + '%');
        $('#grey').html(greyPencent + '%');
    })
}

//任务名称点击事件功能
function Gantt_grid_click(id) {
    var task = gantt.getTask(id)
    var task_elements_id = []
    var status = getTaskStatus(id)
    var color0 = new Glodon.Web.Graphics.Color(status, 0.9);
    var formdata = new FormData()
    formdata.append("sections",JSON.stringify(task.section))
    var sectionElements = []
    $.ajax({
        url: '/get_sectionElements',
        type: 'post',
        //直接将formdata当作参数传过去，加上下面的设置自动进行了csrftoken认证了
        data: formdata,
        dataType: "json",
        processData: false, //不处理数据
        contentType: false, //不设置内容类型
        complete: function() {
        },
        success: function(data) {
            console.log(data)
            if(data.sectionElements){
                viewer3D1.getModel().overrideComponentsColorById(data.sectionElements, color0);
                viewer3D1.render();

            }

        },
        error: function(data) {
            alert('请求出错，错误代码：' + data.status)
        }
    });

}

function GanttClickEvents(date) {
    planned_id = [] //把构件完成日期转换成周数
    finished_id = []
    week_planned_id = []
    week_finished_id = []
    var date_new = new Date(date.valueOf())
    date_new = date_new.addDays(7)

    viewer3D1.getModel().overrideAllComponentsColor(color);
    var actual_tasks = gantt.getTaskBy(task => (task.actual_end_date != '' && new Date(task.actual_end_date) <= date_new));
    var color_list = colorList(actual_tasks)
    var section_list = []
    var week_finished_section = []
    for (var i = 0; i < actual_tasks.length; i++) {
        var status = color_list[i];
        var color0 = new Glodon.Web.Graphics.Color(status, 0.9);
        section_list = section_list.concat(actual_tasks[i].section)
        if (new Date(actual_tasks[i].actual_end_date) > date) {
            week_finished_section = week_finished_section.concat(actual_tasks[i].section)
        }

    }
    if(section_list!=""){
        var formdata = new FormData()
        formdata.append("sections",JSON.stringify(section_list))
        $.ajax({
            url: '/get_sectionElements',
            type: 'post',
            //直接将formdata当作参数传过去，加上下面的设置自动进行了csrftoken认证了
            data: formdata,
            dataType: "json",
            processData: false, //不处理数据
            contentType: false, //不设置内容类型
            complete: function() {
            },
            success: function(data) {
                if(data.sectionElements){
                viewer3D1.getModel().overrideComponentsColorById(data.sectionElements, color0);
                viewer3D1.render();
                }
            },
            error: function(data) {
                alert('请求出错，错误代码：' + data.status)
            }
        });
    
    }
    if(week_finished_section!=""){
        var formdata1 = new FormData()
        formdata1.append("sections",JSON.stringify(week_finished_section))
        $.ajax({
            url: '/get_sectionElements',
            type: 'post',
            //直接将formdata当作参数传过去，加上下面的设置自动进行了csrftoken认证了
            data: formdata,
            dataType: "json",
            processData: false, //不处理数据
            contentType: false, //不设置内容类型
            complete: function() {
            },
            success: function(data) {
                week_finished_id = data.sectionElements
            },
            error: function(data) {
                alert('请求出错，错误代码：' + data.status)
            }
        });

    }
    if(week_finished_id){
    weekHighLight(week_planned_id, week_finished_id)
    }

        //本周完成构建高亮

}
//通过jQuery获取任务状态
function getTaskStatus(id) {
    return $('div[task_id="' + id + '"]').find('div[data-column-name="status"]').find('img').first().attr('class');
}

function getFirstDayOfWeek(date) {
    var day = date.getDay() || 7;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1 - day);
};

//自动播放
$(document).ready(function() {
    var Sdate = gantt.getScale().min_date
    var Edate = gantt.getScale().max_date
    $('#date-confirm').click(function() {
        var speed = $('#speed').val()
        selected_column = null
        clearInterval(loop)
        $('#staticBackdrop').modal('hide')
        var Sdate_new = getFirstDayOfWeek(new Date(Sdate.valueOf()))
        loop = setInterval(function() {
            GanttClickEvents(Sdate_new)
            selected_column = Sdate_new
            gantt.render()
            Sdate_new.addDays(7)
            if (Sdate_new >= Edate) {
                selected_column = null
                gantt.render()
                clearInterval(loop)
            }
        }, speed)
    })
    $('#speed').change(function() {
        speed = $('#speed').val()

    })
    $('#playGantt').click(function() {
        selected_column = null
        clearInterval(loop)
        $('#staticBackdrop').modal('show')
    })
    $('#dateRange').on('apply.daterangepicker', function(ev, picker) {
        Sdate = picker.startDate._d
        Edate = picker.endDate._d
    })

    $('#dateRange').daterangepicker({ //播放时间范围选取
        "showWeekNumbers": true,
        ranges: {
            '本月': [moment().startOf('month'), moment().endOf('month')],
            '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            '全部': [Sdate, Edate],
        },
        "locale": {
            "format": "YYYY/MM/DD",
            "separator": " - ",
            "applyLabel": "确认",
            "cancelLabel": "取消",
            "fromLabel": "从",
            "toLabel": "到",
            "weekLabel": "周",
            "customRangeLabel": "自定义范围",
            "daysOfWeek": [
                "周日",
                "周一",
                "周二",
                "周三",
                "周四",
                "周五",
                "周六"
            ],
            "monthNames": [
                "一月",
                "二月",
                "三月",
                "四月",
                "五月",
                "六月",
                "七月",
                "八月",
                "九月",
                "十月",
                "十一月",
                "十二月",
            ],
            "firstDay": 1
        },
        "startDate": moment().startOf('month').format("YYYY/MM/DD"),
        "endDate": moment().endOf('month').format("YYYY/MM/DD")
    }, function(start, end, label) {
        Sdate = start._d
        Edate = end._d

    });


})

function getMonday(date) {
    var dateTime = date.getTime();
    var day = date.getDay() || 7 //为周日的时候 day 修改为7  否则当天周天会有问题
    var oneDayTime = 24 * 60 * 60 * 1000;
    var MondayTime = dateTime - (day - 1) * oneDayTime; //显示周一
    MondayTime = new Date(MondayTime)
    MondayTime.setHours(0)
    MondayTime.setMinutes(0)
    MondayTime.setSeconds(0)
    MondayTime.setMilliseconds(0)
    return MondayTime;
}
$(document).ready(function() {
        //console.log(process_list)
        var radios = document.getElementsByName("scale");
        for (var i = 0; i < radios.length; i++) {
            radios[i].onclick = function(event) {
                gantt.config.min_column_width = event.target.value;
                gantt.render()
                    //console.log(event.target.value)

            };
        }
        $('#nowStatus').click(function() {
                clearInterval(loop)
                GanttClickEvents(new Date())
                selected_column = getMonday(new Date())
                gantt.render()
            })
            // $('#fullMode').click(function() {
            //     if ($('.modelCover1').css('display') == 'none') {
            //         $('#fullMode').text("双屏联动")
            //         actual.setCameraStatus(actual.getCameraStatus()); //设置双模型展示视角
            //         viewer3D2.render();
            //         viewer3D1.setCameraStatus(actual.getCameraStatus());
            //         viewer3D1.render();
            //         actual.setCameraAnimation(false) //禁用模型的过度动画，不然会影响双模型联动
            //         $('.modelCover2').fadeOut("fast", function() {
            //             $('.models').width('80%')
            //             $('.models').animate({ height: '50%' }, 'slow')
            //             $('.modelCover1').fadeIn()
            //             $('.modelCover2').css({ "width": '50%', "padding": "0 0 20px 10px" })
            //             $('.modelCover2').fadeIn('slow', function() {
            //                 $('.Chart').animate({ height: '45.5%' }, 'slow')
            //                 $('.Chart').show()
            //                 $('.space').show() //包含info的那个div
            //                 window.dispatchEvent(resizeEvent) //触发窗口刷新
            //             })
            //         });
            //     } else {
            //         $('#fullMode').text("大屏展示")
            //         $('.modelCover1').hide()
            //         $('.space').hide()
            //         $('.Chart').hide()
            //         $('.Chart').animate({ height: -99 }, 'slow')
            //         $('.models').width('100%')
            //             // $('.Chart').animate({ height: '22.5%' }, 'fast')
            //         $('.models').animate({ height: '95.5%' }, 'fast')
            //         $('.modelCover2').animate({ width: '100%', padding: "0" }, 'slow', function() {
            //             window.dispatchEvent(resizeEvent) //出发窗口刷新
            //             actual.setCameraAnimation(true) //启用模型过渡动画，更流畅
            //             actual.setCameraStatus(actual.getCameraStatus()); //设置单模型展示视角
            //             viewer3D2.render();
            //         });
            //     }
            // })
    })
    //function colorList(){}
function colorList(actual_tasks) {
    var color_list = []
    for (var i = 0; i < actual_tasks.length; i++) {
        var end_date_new1 = new Date(actual_tasks[i].end_date)
        end_date_new1 = end_date_new1.addDays(1)
        var gap = ((new Date(actual_tasks[i].actual_end_date) - end_date_new1) / (1000 * 60 * 60 * 24))
        if (new Date(actual_tasks[i].actual_end_date) > end_date_new1 && end_date_new1 <= new Date()) {
            if (gap >= 10) {
                color_list.push('#660000')
            } else {
                color_list.push('#BF9000')
            }
        } else if (new Date(actual_tasks[i].actual_end_date) <= end_date_new1) {
            color_list.push('#006600')
        }

    }
    return color_list;
}