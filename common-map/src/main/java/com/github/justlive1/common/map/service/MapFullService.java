package com.github.justlive1.common.map.service;

import java.util.List;

import com.github.justlive1.common.map.domain.Place;

/**
 * 地图全文搜索接口
 * 
 * @author wubo
 *
 */
public interface MapFullService {

	/**
	 * 查询关键字相关地理位置
	 * 
	 * @param keyword
	 * @return
	 */
	List<Place> search(String keyword);
}
