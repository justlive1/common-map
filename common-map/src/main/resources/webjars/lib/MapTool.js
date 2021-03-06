(function() {

	var root = this;
	
	var defaultConfig = {
		appCtx: '',
		zoomMaxLevel: 18,
		initLevel: 8,
		initLon: 118.7878785304,
		initLat: 32.0498661326,
		useMapServer: false,
		mapServerUrl: '',
		showCurrentZoom: true,
		tools: true,
		rectangle: true,
		irRegular: true,
		fullMapSearch: true,
		rectangleCallback: null,
		irregularCallback: null,
		layerswitcher: true
	};
	
	var measureHtml = '<div id="measureResults" class="resultLayers" style="display:none;"><strong>测量结果:</strong><span id="toolResultvalue"></span><br/>双击完成测量，<br/>再次点击测量距离或测量面积按钮释放鼠标！</div>';
	var measureToolHtml = '<div id="measureToolLayers" class="measureToolLayers"><label class="line-polygon" data-id="line"><img /><strong>测量距离</strong></label><label class="line-polygon" data-id="polygon"><img /><strong>测量面积</strong></label></div>';
	var mapContentHtml = '<div><div class="biddsmap"><div class="toolbar"><ul style="list-style-type: none;" class="toolbar-info" id="mapToolsBar"><li><span id="fullMapSearchBar"><input type="text" id="fullMapSearchText" placeholder="搜地点" /><input class="btn map-search" type="button" value="搜索" /></span></li><li><span style="display:none;" id="currentMapZoom"></span><span style="display:none;"><input data-id="rectangle" name="selectType" type="radio" checked="checked" />规则框选</span><span style="display:none;"><input data-id="irregular" name="selectType" type="radio" />不规则框选</span></li></ul></div><div id="_MapTools" style="height:700px;z-index:100;position: relative;"></div></div></div>';
		
	var MapTool = function(id, config) {

		var _id = (id == null) ? 'oLMap' : id;
		var conf = $.extend(defaultConfig, config);
		var _this = this;
		var _status = true;
		var _markers = [];
		
		function getControlForType(type){
			for(var k in _this.control){
				var ctl = _this.control[k];
				if(ctl[0] == type){
					return ctl[1];
				}
			}
		}
		
		function activeForType(type){
			for(var k in _this.control){
				var ctl = _this.control[k];
				if(ctl[0] == type){
					ctl[1].activate();
					$("#mapToolsBar input[data-id='" + type + "']").prop("checked",true);
				}else{
					ctl[1].deactivate();
				}
			}
		}
		
		function destoryMarkers(map, name){
			var markers = map.getLayersByName(name);
			markers.forEach(item => item.destory());
		}
		
		function refreashMarkers(map, name){
			destoryMarkers(map, name);
			var marker = new OpenLayers.Layer.Markers(name);
			map.addLayer(marker);
		}
		
		function handleMeasurements(event){
			var out = " " + event.measure.toFixed(3) + " " + event.units;
			if(event.order != 1){
				out += "<sup>2</sup>";
			}
			$("#toolResultvalue").html(out);
		}
		
		/**
		 * 初始化地图
		 */
		this.init = function() {
			
			$("#" + _id).append(mapContentHtml);
			
			var vectors = new OpenLayers.Layer.Vector('line layer');
			vectors.events.register('beforefeatureadded', vectors, function(){
				vectors.removeAllFeatures();
			});
			
			var map;
			var layer;
			
			if(conf.useMapServer){
				//TODO
				map = new OpenLayers.Map('_MapTools', {
						numZoomLevels: conf.zoomMaxLevel,
						units: 'm',
						projection: new OpenLayers.Projection("EPSG:900913"),
						displayProjection: new OpenLayers.Projection("EPSG:4326")
					});
			}else{
				
				map = new OpenLayers.Map('_MapTools');
				
				layer = new OpenLayers.Layer.WMS("OpenLayers WMS",
						"http://vmap0.tiles.osgeo.org/wms/vmap0?", {
						layers: 'basic'
				});
			}
			map.addLayer(vectors);
			map.addLayer(layer);
			map.addControl(new OpenLayers.Control.MousePosition());
			
			if(conf.layerswitcher){
				map.addControl(new OpenLayers.Control.LayerSwitcher());
			}
			
			_this.vectors = vectors;
			_this.map = map;
			_this.control = [];
			
			if(conf.showCurrentZoom){
				_this.registerZoomEvent();
			}
			
			if(conf.rectangle){
				_this.registerRectangle(conf.rectangleCallback);
				$("#mapToolsBar input[data-id='rectangle']").parent().show();
				$("#" + _id).on('click', "#mapToolsBar input[data-id='rectangle']", function(){
					_this.activeRectangle();
				});
			}
			
			if(conf.irRegular){
				_this.registerIrRegular(conf.irregularCallback);
				$("#mapToolsBar input[data-id='irregular']").parent().show();
				$("#" + _id).on('click', "#mapToolsBar input[data-id='irregular']", function(){
					_this.activeIrRegular();
				});
			}
			
			if(conf.tools){
				_this.registerTools();
			}
			
			if(conf.fullMapSearch){
				_this.registerFullMapSearch();
			}
			
			if(_this.control.length > 0){
				_this.control[0][1].activate();
			}
			
			_this.setMapCenter();

		};
		
		/**
		 * 注册滚轮事件
		 */
		this.registerZoomEvent = function(callback){
			$("#currentMapZoom").show();
			 _this.map.events.register("zoomend", this, function (e) {
			       var zoom = _this.map.getZoom();
			       $("#currentMapZoom").text(zoom);
			 });
		};
		
		/**
		 * 增加地图全文搜索
		 */
		this.registerFullMapSearch = function(callback){
			
			$("#fullMapSearchBar").show();
			
			$("#" + _id).on('click', "#fullMapSearchBar input[type='button']", function(){
				
				var keyword = $("#fullMapSearchText").val();
				if(keyword == null || keyword == ''){
					alert('请输入查询关键字！');
					return;
				}
				
				$.ajax({
					url: conf.appCtx + "/mapFull/search",
					type: 'post',
					data: {
						keyword : keyword
					},
					success: function(data){
						console.log(data)
						if(data.code == '0'){
							if(data.content != null && data.content.length > 0){
								_this.clearMarker('markers');
								
								$.each(data.content,function(index, item){
									
									var lonlat = new OpenLayers.LonLat(item.diPointX/100, item.diPointY/100);
									lonlat.transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
									
									_this.addMarker(lonlat, item.addr);
								});
								
							}else{
								alert('未查询到数据');
							}
						}else{
							alert(data.msg || '查询失败！')
						}
					},
					error: function(e){
						alert("查询失败！");
					}
				});
				
				
			});
			
		};
		
		/**
		 * 注册规则框选
		 */
		this.registerRectangle = function(callback){
			
			var rectangle = new OpenLayers.Control.DrawFeature(
				_this.vectors,	
				OpenLayers.Handler.RegularPolygon,
				{
					handlerOptions: {
						irregular: true,
						keyMask: OpenLayers.Handler.MOD_SHIFT
					},
					featureAdded: function(feature){
						if(_status && callback != null && typeof callback === 'function'){
							callback(feature);
						}
					}
				}
			);
			
			_this.map.addControl(rectangle);
			_this.control.push(['rectangle', rectangle]);
		};
		
		/**
		 * 注册不规则框选
		 */
		this.registerIrRegular = function(callback) {
			
			var vectorsIr = new OpenLayers.Layer.Vector('irregular layer');
			vectorsIr.events.register('beforefeatureadded', vectorsIr, function(){
				vectorsIr.removeAllFeatures();
			});
			
			var irregular = new OpenLayers.Control.DrawFeature(
				vectorsIr,	
				OpenLayers.Handler.Polygon,
				{
					handlerOptions: {
						keyMask: OpenLayers.Handler.MOD_SHIFT
					},
					featureAdded: function(feature){
						if(_status && callback != null && typeof callback === 'function'){
							callback(feature);
						}
					}
				}
			);
			
			_this.vectorsIr = vectorsIr;
			_this.map.addLayer(vectorsIr);
			_this.map.addControl(irregular);
			_this.control.push(['irregular', irregular]);
			
		};
		
		/**
		 * 注册地图工具
		 */
		this.registerTools = function() {
			
			OpenLayers.INCHES_PER_UNIT['千米'] = OpenLayers.INCHES_PER_UNIT['km'];
			OpenLayers.INCHES_PER_UNIT['米'] = OpenLayers.INCHES_PER_UNIT['m'];
			OpenLayers.INCHES_PER_UNIT['英里'] = OpenLayers.INCHES_PER_UNIT['mi'];
			OpenLayers.INCHES_PER_UNIT['英尺'] = OpenLayers.INCHES_PER_UNIT['ft'];
			
			var measureToolPanel = new OpenLayers.Control.Panel({
				createControlMarkup: function(){
					return $(measureToolHtml.replace(/{appCtx}/g, conf.appCtx))[0];
				}
			});
			
			measureToolPanel.addControls(new OpenLayers.Control.Button());
			_this.map.addControl(measureToolPanel);
			
			var toolLayersStyle = $("#measureToolLayers").parent().attr('style');
			$("#measureToolLayers").parent().attr('style', toolLayersStyle + ";right:10px;top:10px;");

			var measurePanel = new OpenLayers.Control.Panel({
				createControlMarkup: function() {
					return $(measureHtml)[0];
				}
			});
			
			measurePanel.addControls(new OpenLayers.Control.Button());
			_this.map.addControl(measurePanel);
			
			var resultStyle = $("#measureResults").parent().attr('style');
			$("#measureResults").parent().attr('style', resultStyle + ";left:55px;top:10px;");

			
			var sketchSymbolizers = {
				"Point": {
					pointRadius: 4,
					graphicName: "square",
					fillColor: "white",
					fillOpacity: 1,
					strokeWidth: 1,
					strokeOpacity: 1,
					strokeColor: "#333333"
				},
				"Line": {
					strokeWidth: 2,
					strokeOpacity: 1,
					strokeColor: "#666666"
				},
				"Polygon": {
					strokeWidth: 2,
					strokeOpacity: 1,
					strokeColor: "#666666",
					fillColor: "white",
					fillOpacity: 0.5
				}
			};
			
			var style = new OpenLayers.Style();
			style.addRules([new OpenLayers.Rule({
				symbolizer: sketchSymbolizers
			})]);
			
			var styleMap = new OpenLayers.StyleMap({
				"default": style
			});
			
			var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
			renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
			
			var myMeasureTools = {};
			myMeasureTools.line = new OpenLayers.Control.Measure(
				OpenLayers.Handler.Path,
				{
					persist: true,
					handlerOptions: {
						layerOptions: {
							renderers: renderer,
							styleMap: styleMap
						}
					}
				}
			);
			
			myMeasureTools.polygon = new OpenLayers.Control.Measure(
					OpenLayers.Handler.Polygon,
					{
						persist: true,
						handlerOptions: {
							layerOptions: {
								renderers: renderer,
								styleMap: styleMap
							}
						}
					}
				);
			
			myMeasureTools.line.events.on({
				"measure": handleMeasurements,
				"measurepartial": handleMeasurements
			});
			
			myMeasureTools.polygon.events.on({
				"measure": handleMeasurements,
				"measurepartial": handleMeasurements
			});
			
			_this.map.addControls([myMeasureTools.line, myMeasureTools.polygon]);
			
			var scaleLine = new OpenLayers.Control.ScaleLine({
				topOutUnits: "千米",
				topInUnits: "米",
				bottomOutUnits: "英里",
				bottomInUnits: "英尺"
			});
			
			_this.map.addControl(scaleLine);
			_this.myMeasureTools = myMeasureTools;
			
			$("#" + _id).on('click', ".line-polygon", function(){
				
				var id = $(this).data('id');
				if(id == 'line'){
					$('.line-polygon[data-id="polygon"]').css("background","rgba(0,0,0,0)");
				}else{
					$('.line-polygon[data-id="line"]').css("background","rgba(0,0,0,0)");
				}
				
				for(var key in _this.myMeasureTools){
					var control = _this.myMeasureTools[key];
					if(id == key){
						control.activate();
					}else{
						control.deactivate();
					}
				}
				
				if($(this).css("background-color") == 'rgb(159, 208, 233)') {
					$("#measureResults").hide();
					$(this).css("background-color", "rgba(0,0,0,0)");
					_this.myMeasureTools[id].deactivate();
				}else{
					$("#toolResultvalue").html('');
					$("#measureResults").show();
					$(this).css("background-color", "rgb(159, 208, 233)");
				}
				
			});
			
		};
		
		/**
		 * 激活规则框选
		 */
		this.activeRectangle = function() {
			_this.clearFeatures(1);
			_this.clearAllMarker();
			activeForType('rectangle');
		};
		
		/**
		 * 激活不规则框选
		 */
		this.activeIrRegular = function() {
			_this.clearFeatures(0);
			_this.clearAllMarker();
			activeForType('irregular');
		};

		/**
		 * 设置地图中心点
		 * @param lon 经度
		 * @param lat 纬度
		 * @param level 显示级别
		 */
		this.setMapCenter = function(lon, lat, level) {
			
			if(lon == null || lat == null){
				lon = conf.initLon;
				lat = conf.initLat;
			}
			
			if(level == null){
				level = conf.initLevel;
			}
			
			var lonLat = new OpenLayers.LonLat(lon, lat);
			if(conf.useMapServer){
				lonLat.transform(_this.map.displayProjection, _this.map.getProjectionObject());
			}
			_this.map.setCenter(lonLat, level);
		};
		
		/**
		 * 获取地图绘制状态
		 * 提供给外部定制化图形绘制回调使用
		 */
		this.getStatus = function() {
			return _status;
		};
		
		/**
		 * 设置地图绘制状态 false 默认，true 选择
		 * 提供给外部定制化图形绘制回调使用
		 */
		this.setStatus = function() {
			if(status){
				_status = true;
			}else{
				_status = false;
			}
		};
		
		/**
		 * 清除绘制的图形
		 * @param type 0：规则框选，1：不规则框选
		 */
		this.clearFeatures = function(type) {
			
			if(type == 0){
				_this.vectors.removeAllFeatures();
			}else{
				_this.vectorsIr.removeAllFeatures();
			}
			
		};
		
		/**
		 * 清除图层
		 * @param name 图层名称
		 */
		this.clearMarker = function(name) {
			name = name || 'markers';
			destoryMarkers(_this.map, name);
		};
		
		/**
		 * 清除所有图层
		 */
		this.clearAllMarker = function() {
			
			$.each(_markers, function(index, item){
				destoryMarkers(_this.map, item);
			});
		};
		
		/**
		 * 坐标转换
		 */
		this.transform = function(point) {
			return point.clone().transform(_this.map.getProjectionObject(), _this.map.displayProjection);
		};
		
		/**
		 * 添加标记<br>
		 * @param item 必须包含 lon:经度，lat:纬度 属性
		 * @param msg 点击标记弹出框的显示文字，或者是对item处理并返回string的funtion
		 * 
		 */
		this.addMarker = function(item, msg) {

			var markers = _this.map.getLayersByName('markers');
            if(markers.length == 0){
            	markers = new OpenLayers.Layer.Markers("markers");
            	_this.map.addLayer(markers);
            }else{
            	markers = markers[0];
            }

            var size = new OpenLayers.Size(21,25);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
            var icon = new OpenLayers.Icon(conf.appCtx + '/webjars/syslib/img/marker.png',size,offset);
            var lonlat = new OpenLayers.LonLat(item.lon,item.lat);
            lonlat = _this.transform(lonlat);
            var marker = new OpenLayers.Marker(lonlat,icon)
            
            if(msg != null){
            	
            	var line = msg;
            	
            	if(typeof msg === 'function'){
            		line = msg(item);
            	}
            	
            	marker.events.register('click', marker, function(evt){
            		var popup = new OpenLayers.Popup.FramedCloud("popup", lonlat, null, line, null, true);
            		popup.closeOnMove = true;
            		_this.map.addPopup(popup, true);
            	});
            }
            
            markers.addMarker(marker);

		};
		
	};

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = MapTool;
		}
		exports.MapTool = MapTool;
	} else if (typeof define === 'function' && define.amd) {
		define('MapTool', function() {
			return MapTool;
		});
	} else {
		root['MapTool'] = MapTool;
	}

}).call(this);