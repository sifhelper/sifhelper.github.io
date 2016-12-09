var jpEventEndDateTime = moment("");

var $currentRank = $("#current-rank");
var $currentExp = $("#current-exp");
var $currentLp = $("#current-lp");
var $targetPt = $("#target-pt");
var $currentPt = $("#current-pt");
var $endDatetime = $("#end-datetime");
var $difficulty = $("#difficulty");
var $expectedScore = $("#score");
var $expectedRanking = $("#ranking");


$(function() {
  $(".datetimepicker").datetimepicker({
    format: momentFormatString
  });

  $("#difficulty-dropdown-menu li a").click(changeDifficulty);
  $("#score-dropdown-menu li a").click(changeScore);
  $("#ranking-dropdown-menu li a").click(changeRanking);

  $("#sif-calculate").click(showInput);

  if (jpEventEndDateTime.isValid()) {
    $endDatetime.val(jpEventEndDateTime.format(momentFormatString));
  }
});

function changeDifficulty() {
  $difficulty.text($(this).text());
}

function changeScore() {
  $expectedScore.text($(this).text());
}

function changeRanking() {
  $expectedRanking.text($(this).text());
}

function showInput() {
  errorTicket = false;
  showLovecaNeeded();
}


var ScoreMatch = function (endDatetime,
  difficulty, expectedScore, expectedRanking) {

  Event.call(this, endDatetime);

  this.difficulty = difficulty;
  this.expectedScore = expectedScore;
  this.expectedRanking = expectedRanking;
};

ScoreMatch.prototype = Object.create(Event.prototype);

ScoreMatch.prototype.getTimeNeededPerGame = function () {
  return timeNeededPerSong;
};

ScoreMatch.prototype.getLpNeededPerGame = function () {
  switch (this.difficulty) {
    case "Technical":
    case "Expert":
    return 25;
    case "Hard":
    return 15;
    case "Normal":
    return 10;
    case "Easy":
    return 5;
    default:
    // TODO: error handing
  }
};

ScoreMatch.prototype.getScoreBonus = function () {
  switch (this.expectedScore) {
    case "S":
    return 1.20;
    case "A":
    return 1.15;
    case "B":
    return 1.10;
    case "C":
    return 1.05;
    default:
    return 1.00;
  }
};

ScoreMatch.prototype.getRankingBonus = function () {
  switch (this.expectedRanking) {
    case "1st":
    return 1.25;
    case "2nd":
    return 1.15;
    case "3rd":
    return 1.05;
    case "4th":
    return 1.00;
    default:
    // TODO: error handling
  }
};

ScoreMatch.prototype.getPtGainedPerGame = function () {
  var basePt = 0;
  switch (this.difficulty) {
    case "Technical":
    case "Expert":
    basePt = 357;
    break;
    case "Hard":
    basePt = 177;
    break;
    case "Normal":
    basePt = 100;
    break;
    case "Easy":
    basePt = 42;
    break;
    default:
    // TODO: error handling
  }
  return Math.round(basePt * this.getScoreBonus() * this.getRankingBonus());
};

ScoreMatch.prototype.getExpGainedPerGame = function () {
  return this.getExpGained(this.difficulty);
};

function showLovecaNeeded() {
  var maxFinalPt = -1;
  var loveca = 0;

  while (true) {
    var currentRank = parseInt($currentRank.val()) || 0;
    var currentExp = parseInt($currentExp.val()) || 0;
    var currentLp = parseInt($currentLp.val()) || 0;
    var targetPt = parseInt($targetPt.val()) || 0;
    var currentPt = parseInt($currentPt.val()) || 0;

    var user = new User(currentRank, currentExp, currentLp, targetPt, currentPt);
    setHasError($currentRank, (user.rank < 1));

    var remainingTime = $endDatetime.val();
    var difficulty = $difficulty.text();
    var expectedScore = $expectedScore.text();
    var expectedRanking = $expectedRanking.text();

    var scoreMatch = new ScoreMatch(remainingTime,
    difficulty, expectedScore, expectedRanking);
    // the event should not be ended, or has duration longer then 2 weeks
    setHasError($endDatetime, !(0 <= scoreMatch.remainingTime && scoreMatch.remainingTime <= 60 * 24 * 14));

    if (errorTicket === true) {
      break;
    }

    var user = getFinalUserState(loveca, user, scoreMatch);
    if (user.currentPt <= maxFinalPt) {
      break;
    }

    maxFinalPt = user.currentPt;
    if (maxFinalPt >= user.targetPt) {
      break;
    } else {
      loveca++;
    }
  }

  if (errorTicket == false) {
    var message = "Loveca needed = " + loveca + "\n" +
    "==========\n" +
    "Final Rank: " + user.rank + "\n" +
    "Final Exp = " + user.exp + "\n"  +
    "Final Pt = " + user.currentPt + "\n";

    window.alert(message);
  }
}