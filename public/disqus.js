/* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * */
var disqus_shortname = 'geobadges'; // Required - Replace '<example>' with your forum shortname
var splitArr = location.href.split('/');
var disqus_identifier = 'disqus_badge_thread_' + splitArr[splitArr.length-1];
var disqus_title = window.badgeTitle;
var disqus_url = 'http://www.geobadges.org/' + window.badgeTitle;

/* * * DON'T EDIT BELOW THIS LINE * * */
(function() {
    var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
    dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
})();