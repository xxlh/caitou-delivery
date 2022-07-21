# Caitou Delivery Api

菜头骑士端

安卓打包依赖菜头骑士安卓端：https://github.com/ee01/caitou-delivery-android

## Install
Run `npm install` to intiate

Make link with build source to Android assets source by `ln -s src/unpackage/resources/__UNI__ECEC08F /Users/xxx/AndroidStudioProjects/Caitou-Delivery/app/src/main/assets/apps/__UNI__ECEC08F`

Download and install android simulator `Pixel 2 API 27`

### Keep android mobile SDK version consistant

Download latest android mobile SDK version to android reposity `AndroidStudioProjects/Caitou-Delivery/app/libs` from https://nativesupport.dcloud.net.cn/AppDocs/download/android

Run `npx @dcloudio/uvm alpha` or Search the corresponding version number with `npm view @dcloudio/uni-xxx versions`, and run `npm i @dcloudio/uni-xxx@0.0.0 -S` for every dependencies to upgrade.
See more: https://uniapp.dcloud.io/quickstart.html#修改依赖为指定版本

(Or) Upgrade HBuilderX to corresponding version

Run `发行`->`原生App-云打包`, check `打自定义调试基座` in HBuilderX

## Debuge

Run `/Users/Esone/Library/Android/sdk/emulator  -avd Pixel_2_API_27 -dns-server 8.8.8.8` to ensure the android emulator can connect to network

(未验证，理论实现差量编译) Relink with build source to Android assets source by `ln -s dist/dev/app /Users/xxx/AndroidStudioProjects/Caitou-Delivery/app/src/main/assets/apps/__UNI__ECEC08F/www`

Click `Make Project` icon in Android Studio then click `Run` icon to run assets to emulator

## Deploy

### Build
Run `npm run build` to build android assets

(Or) Run `发行`->`原生App-本地打包`->`生成本地打包App资源` in HBuilderX with openning `src` folder of Android reposity

Run `Build`->`Build Bundle(s)/APK(s)`->`APK(s)` in Android Studio with android reposity above

### Deploy in Production
Upload APK to `升级中心` at http://upgrade.admin.caitou.ieexx.com/

User will get automatic upgrading prompt after App launching

## License

The Lumen framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
