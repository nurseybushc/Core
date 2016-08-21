ProfileController.$inject = ["$rootScope", "$location", "ModalService", "localStorageService", "APIService", "$routeParams"];

export default ProfileController;

function ProfileController($rootScope, $location, ModalService, localStorageService, APIService, $routeParams) {

  let vm = this;

  vm.loading = true;

  // vm.plugins = [];
  // vm.modlist = [];
  // vm.ini = [];
  // vm.prefsini = [];
  // vm.skse = [];
  // vm.enblocal = [];

  vm.hasPlugins = false;
  vm.hasModlist = false;
  vm.hasIni = false;
  vm.hasPrefsIni = false;
  vm.hasSKSE = false;
  vm.hasENBLocal = false;

  let files = [];

  vm.currentFilename = "plugins";
  vm.modlistChecked = true;
  vm.authenticated = false;
  vm.user = {};
  vm.voting = false;

  vm.user.username = $routeParams.username;
  $rootScope.pageTitle = `Modwat.ch - ${vm.user.username}`;
  //vm.user.isOwner = vm.user.username === vm.$parent.user.username;

  let token = localStorageService.get("token");

  let i = 0;
  let j = 0;

  if (token) {
    APIService.checkToken(token)
    .then(res => {
      vm.user.isOwner = vm.user.username === res.username;
      vm.authenticated = true;
    })
    .catch(e => {
      console.log(err);
    });
  }

  vm.switchFiles = function(filename) {
    vm.filterMods = undefined;
    vm.currentFilename = filename;
    APIService.getFile(vm.user.username, filename)
    .then(getFile)
    .catch(e => {
      //console.log(res);
    });
  };

  vm.newTag = function(tag) {
    APIService.setTag(vm.user.username, tag || vm.tag)
    .then(res => {
      // console.log(res);
    })
    .catch(e => {
      // console.log(e);
    });
  };

  vm.newENB = function(enb) {
    APIService.setENB(vm.user.username, enb || vm.enb)
    .then(res => {
      // console.log(res);
    })
    .catch(e => {
      // console.log(e);
    });
  };

  vm.openEdit = () => {
    ModalService.edit({
      user: () => {
        return vm.user.username;
      }
    });
  };
  init();

  /**
   *  Scoring Logic
   */

  vm.upvote = function upvote(votee) {
    vm.voting = true;
    APIService.upvote(votee || vm.user.username, token)
    .then(res => {
      vm.voting = false;
      vm.score = res.score;
    })
    .catch(e => {
      vm.voting = false;
      console.log(e);
    });
  };
  vm.downvote = function downvote(votee) {
    vm.voting = true;
    APIService.downvote(votee || vm.user.username, token)
    .then(res => {
      vm.voting = false;
      vm.score = res.score;
    })
    .catch(e => {
      vm.voting = false;
      console.log(e);
    });
  };

  function init() {
    APIService.getFileNames(vm.user.username)
    .then(files => {
      if(files.length > 0) {
        for (i = 0; i < files.length; i++) {
          //vm.currentFilename = ($location.path().substr(1) === files[i]) ? files[i] : vm.currentFilename;
          if (files[i] === "plugins") {
            vm.hasPlugins = true;
          } else if (files[i] === "modlist") {
            vm.hasModlist = true;
          } else if (files[i] === "ini") {
            vm.hasIni = true;
          } else if (files[i] === "prefsini") {
            vm.hasPrefsIni = true;
          } else if (files[i] === "skse") {
            vm.hasSKSE = true;
          } else if (files[i] === "enblocal") {
            vm.hasENBLocal = true;
          }
        }

        APIService.getFile(vm.user.username, vm.currentFilename)
        .then(getFile)
        .catch(getFileRes => {
          //console.log(getFileRes);
        });
        APIService.getProfile(vm.user.username)
        .then(getProfileRes => {
          vm.badge = getProfileRes.badge;
          vm.timestamp = getProfileRes.timestamp;
          vm.game = getProfileRes.game;
          vm.enb = getProfileRes.enb;
          vm.tag = getProfileRes.tag;
          vm.score = getProfileRes.score;
        })
        .catch(getProfileErr => {
          //console.log(getProfileErr);
        });
      } else {
        vm.noFiles = true;
      }
    })
    .catch(e => {
      //console.log(e);
    });
  }

  function clearToken() {
    localStorageService.remove("token");
    vm.authenticated = false;
  }

  function getFile(data) {
    for (i = 0; i < data.length; i++) {
      data[i] = {
        id: `index${i}`,
        display: data[i]
      };
    }
    if (vm.currentFilename === "plugins") {
      vm.plugins = data;
      for (i = 0; i < data.length; i++) {
        if (data[i].display.indexOf("#") === 0) {
          data.splice(i, 1);
          i--;
        }
      }
    } else if (vm.currentFilename === "modlist") {
      let reversed = [];
      for (i = 0, j = data.length - 1; i < data.length; i++, j--) {
        reversed[i] = data[j];
      }
      vm.modlist = reversed;
    } else if (vm.currentFilename === "ini") {
      vm.ini = data;
    } else if (vm.currentFilename === "prefsini") {
      vm.prefsini = data;
    } else if (vm.currentFilename === "skse") {
      vm.skse = data;
    } else if (vm.currentFilename === "enblocal") {
      vm.enblocal = data;
    }
  }
}