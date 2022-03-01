type LocationResult = {
    lng: number,
    lat: number,
    province?: string,
    city?: string,
    district?: string,
    address?: string,
}

class Tracking {
    wxp_Amap:any;
    timer = 0;
    interval = 30000;
    onChange = (res:LocationResult) => {};

    constructor (parameters:{interval?:number, onChange:()=>void}) {
        if (parameters.interval) this.interval = parameters.interval*1000;
        this.onChange = parameters.onChange;
    }

    init() {
        uni.getLocation({
            type: 'gcj02',
            success: (res) => {
                this.onChange({
                    lng: res.longitude,
                    lat: res.latitude,
                    province: res.address?.province,
                    city: res.address?.city,
                    district: res.address?.district,
                    address: res.address?.street + res.address?.streetNum,
                });
                // #ifdef APP-PLUS
                this.wxp_Amap = uni.requireNativePlugin("WXP-Amap");
                this.wxp_Amap.start({
                    setInterval: this.interval, // 定位间隔，单位 ms，不是必须的，默认 2000ms
                    cacheEnable: true // 是否允许缓存，默认为true，既当位置不变时返回最后一次定位的地址，不是必须的
                }, (result:any) => {
                    // 处理回调结果
                    this.onChange({
                        lng: result.lng,
                        lat: result.lat,
                        province: result.province,
                        city: result.city,
                        district: result.district,
                        address: result.address,
                    });
                })
                // #endif
                
                // #ifdef H5
                this.timer = setInterval(() => {
                    uni.getLocation({
                        type: 'gcj02',
                        geocode: true,
                        success: (res) => {
                            this.onChange({
                                lng: res.longitude,
                                lat: res.latitude,
                                province: res.address?.province,
                                city: res.address?.city,
                                district: res.address?.district,
                                address: res.address?.street + res.address?.streetNum,
                            });
                        },
                    });
                }, this.interval);
                // #endif
            },
            fail: (e) => {
                uni.showModal({
					title: '定位获取失败',
					content: '请到系统设置->应用管理 中开启本App的定位权限为【始终允许】',
					showCancel: false
                });
                // #ifdef APP-PLUS
                this.wxp_Amap = uni.requireNativePlugin("WXP-Amap");
                this.wxp_Amap.permission();
                // #endif
            },
        })
    }
    
    destroy() {
        // #ifdef APP-PLUS
        if (!this.wxp_Amap) uni.showToast({title: "还没有初始化呢"})
        this.wxp_Amap.stop();
        // #endif
        
        // #ifdef H5
        clearInterval(this.timer);
        // #endif
    }
}

export default Tracking;