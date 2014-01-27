exports.lib = {
    timeDiff: function(dateString) {
        var day = 60 * 60 * 24,
            hour = 60 * 60,
            min = 60;

        var diff = Math.round((new Date() - new Date(dateString)) / 1000);
        if (diff >= day) {
            return Math.round(diff / day) + " 天前";
        } else if (diff >= hour) {
            return Math.round(diff / hour) + " 小時前";
        } else if (diff >= min) {
            return Math.round(diff / min) + " 分鐘前";
        } else {
            return "剛剛";
        }
    },
    dateString: function(date) {
        var d = new Date(date);
        return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + (d.getDate()) + "日";
    }
};