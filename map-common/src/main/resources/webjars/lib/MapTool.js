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
		tools: true,
		rectangle: true,
		irRegular: true,
		rectangleCallback: null,
		irregularCallback: null,
		layerswitcher: true
	};
	
	var measureHtml = '<div id=""measureResults" class="resultLayers" style="display:none;"><strong>测量结果:</strong><span id="toolResultvalue"></span><br/>双击完成测量，<br/>再次点击测量距离或测量面积按钮释放鼠标！</div>';
	var measureToolHtml = '<div id="measureToolLayers" class="measureToolLayers"><label class="line-polygon" data-id="line"><img /><strong>测量距离</strong></label><label class="line-polygon" data-id="polygon"><img /><strong>测量面积</strong></label></div>';
	var mapContentHtml = '<div><div class="biddsmap"><div class="toolbar"><ul style="list-style-type: none;" class="toolbar-info" id="mapToolsBar"><li><span id="currentMapZoom"></span></li><li><span style="display:none;"><input data-id="rectangle" name="selectType" type="radio" checked="checked" />规则框选</span><span style="display:none;"><input data-id="irregular" name="selectType" type="radio" />不规则框选</span></li></ul></div><div id="_MapTools" style="height:700px;z-index:100;position: relative;"></div></div></div>';
		
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
					//TODO 
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
			
			if(conf.rectangle){
				_this.registerRectangle(conf.rectangleCallback);
				$("#mapToolsBar input[data-id='rectangle']").parent().show();
				$("#mapToolsBar input[data-id='rectangle']").on('click', function(){
					_this.activeRectangle();
				});
			}
			
			if(conf.irRegular){
				_this.registerIrRegular(conf.irregularCallback);
				$("#mapToolsBar input[data-id='irregular']").parent().show();
				$("#mapToolsBar input[data-id='irregular']").on('click', function(){
					_this.activeIrRegular();
				});
			}
			
			if(conf.tools){
				_this.registerTools();
			}
			
			if(_this.control.length > 0){
				_this.control[0][1].activate();
			}
			
			_this.setMapCenter();

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