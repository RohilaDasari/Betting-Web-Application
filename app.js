angular.module('app',[])

.controller('Controller', ['$scope', '$http',function($scope, $http){
    $scope.selectedGroup = {};
    $scope.selectedSubGroup = {};
    $scope.selectedPool = {};
    $scope.poolData = {};
    $scope.groups = [];
    $scope.pools = [];
    $scope.poolDetailSection = false;
    $scope.loadGroups = function(){
        $http.get('//colossusdevtest.herokuapp.com/api/pools.json').then(function(response){
            $scope.groups = response.data;
        });
    };
    //call loadGroups when controller initialized
    $scope.loadGroups();
    
    //Function call for loading pools when group is selected
    $scope.groupChange = function(group){
        $scope.poolData = {};
        $scope.pools = [];
        if(group.pools.length > 0){
            $scope.pools = group.pools;
        }
    };
    //Function call for loading pool details when pool is selected
    $scope.poolChange = function(pool){
        $http.get('//colossusdevtest.herokuapp.com/api/pools/'+pool.id+'.json').then(function(response){
                $scope.poolData = response.data;
                $scope.poolDetailSection = true;
        });
    };
    
}])

.controller('poolDetailController', ['$scope', '$http',function($scope, $http){
    $scope.selectedPool = $scope.poolData.pool_stake.stakes[0];
    $scope.toggleSelection = function(selection,leg) {
        for(var i=0; i<$scope.poolData.legs.length; i++){
            if($scope.poolData.legs[i].id == leg.id){
                for(var j=0; j<$scope.poolData.legs[i].selections.length; j++){
                    if($scope.poolData.legs[i].selections[j].id == selection.id){
                        if($scope.poolData.legs[i].selections[j].selected === undefined || !$scope.poolData.legs[i].selections[j].selected){
                            $scope.poolData.legs[i].selections[j].selected = true;
                        }else{
                            $scope.poolData.legs[i].selections[j].selected = false;
                        }
                    }
                }
            }
        }
        $scope.numberOfLines();
    }
    $scope.final = 0;
    $scope.numberOfLines = function(){
        var linesarray = [];
        for(var i=0; i<$scope.poolData.legs.length; i++){
                var count = 0;
                for(var j=0; j<$scope.poolData.legs[i].selections.length; j++){
                    if($scope.poolData.legs[i].selections[j].selected){
                        count++;          
                    }
                }
                if(count !== 0)
                    linesarray.push(count);
        }
        var final = 1;
        for(var i=0;i<linesarray.length;i++){
            final = final * linesarray[i];    
        }
        if(linesarray.length == 0)
            final = 0;
        $scope.final = final;
    };
    $scope.placeBet = function(){
        var selectedIDS = [];
        for(var i=0; i<$scope.poolData.legs.length; i++){
                for(var j=0; j<$scope.poolData.legs[i].selections.length; j++){
                    if($scope.poolData.legs[i].selections[j].selected){
                        selectedIDS.push($scope.poolData.legs[i].selections[j].id);         
                    }
                }
        }
        var request = {
           'NumberOflines' : $scope.final,
           'totalCost':$scope.selectedPool * $scope.final,
           'selectedIDs':selectedIDS
        }
       $http.post('//colossusdevtest.herokuapp.com/api/tickets.json', request).then(function(response){
             alert("Placed Bet SuccessFully");  
        }); 
    };
}])

.directive("poolDetail", function(){
    return {
        restrict: "EA",
        scope: {
            poolData: "=",           
        },
        link: function (scope, element, attributes, switcherController) {
            
        },
        controller: "poolDetailController",
        templateUrl: "poolDetail.html"
    };
});
