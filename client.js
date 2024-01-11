//статы времени
var WaitingPlayersTime = 5;
var BuildBaseTime = 60;
var GameModeTime = 420;
var EndOfMatchTime = 10;

// êîíñòàíòû èìåí
var WaitingStateValue = "Waiting";
var BuildModeStateValue = "BuildMode";
var GameStateValue = "Game";
var EndOfMatchStateValue = "EndOfMatch";

// ïîñòîÿííûå ïåðåìåííûå
var mainTimer = Timers.GetContext().Get("Main");
var stateProp = Properties.GetContext().Get("State");

// ïðèìåíÿåì ïàðàìåòðû ñîçäàíèÿ êîìíàòû
Build.GetContext().FlyEnable.Value = GameMode.Parameters.GetBool("Fly");
Damage.GetContext().DamageOut.Value = GameMode.Parameters.GetBool("Damage");
Build.GetContext().FloodFill.Value = GameMode.Parameters.GetBool("FloodFill");

// áëîê èãðîêà âñåãäà óñèëåí
BreackGraph.PlayerBlockBoost = true;

// ïàðàìåòðû èãðû
Properties.GetContext().GameModeName.Value = "GameModes/Team Dead Match";
TeamsBalancer.IsAutoBalance = true;
Ui.GetContext().MainTimerId.Value = mainTimer.Id;
// ñîçäàåì êîìàíäû
Teams.Add("Blue", "Обороняющиеся", { r: 40, g: 37, b: 155 });
Teams.Add("Red", "Штурмующие", { r: 193, g: 54, b: 54  });
var BD = Teams.Get("Blue");
var RD = Teams.Get("Red");
BD.Spawns.SpawnPointsGroups.Add(1);
RD.Spawns.SpawnPointsGroups.Add(2);
BD.Build.BlocksSet.Value = BuildBlocksSet.Blue;
RD.Build.BlocksSet.Value = BuildBlocksSet.Red;

// çàäàåì ìàêñ ñìåðòåé êîìàíä
var maxDeaths = Players.MaxCount * 5;
Teams.Get("Red").Properties.Get("Deaths").Value = maxDeaths;
Teams.Get("Blue").Properties.Get("Deaths").Value = maxDeaths;
// çàäàåì ÷òî âûâîäèòü â ëèäåðáîðäàõ
LeaderBoard.PlayerLeaderBoardValues = [
	{
		Value: "Kills",
		DisplayName: "Statistics/Kills",
		ShortDisplayName: "Statistics/KillsShort"
	},
	{
		Value: "Deaths",
		DisplayName: "Statistics/Deaths",
		ShortDisplayName: "Statistics/DeathsShort"
	},
	{
		Value: "Spawns",
		DisplayName: "Statistics/Spawns",
		ShortDisplayName: "Statistics/SpawnsShort"
	},
	{
		Value: "Scores",
		DisplayName: "Statistics/Scores",
		ShortDisplayName: "Statistics/ScoresShort"
	}
];
LeaderBoard.TeamLeaderBoardValue = {
	Value: "Deaths",
	DisplayName: "Statistics\Deaths",
	ShortDisplayName: "Statistics\Deaths"
};
// âåñ êîìàíäû â ëèäåðáîðäå
LeaderBoard.TeamWeightGetter.Set(function(team) {
	return team.Properties.Get("Deaths").Value;
});
// âåñ èãðîêà â ëèäåðáîðäå
LeaderBoard.PlayersWeightGetter.Set(function(player) {
	return player.Properties.Get("Kills").Value;
});

// çàäàåì ÷òî âûâîäèòü ââåðõó
Ui.GetContext().TeamProp1.Value = { Team: "Blue", Prop: "Deaths" };
Ui.GetContext().TeamProp2.Value = { Team: "Red", Prop: "Deaths" };

// ðàçðåøàåì âõîä â êîìàíäû ïî çàïðîñó
Teams.OnRequestJoinTeam.Add(function(player,team){team.Add(player);});
// ñïàâí ïî âõîäó â êîìàíäó
Teams.OnPlayerChangeTeam.Add(function(player){ player.Spawns.Spawn()});

// äåëàåì èãðîêîâ íåóÿçâèìûìè ïîñëå ñïàâíà
var immortalityTimerName="immortality";
Spawns.GetContext().OnSpawn.Add(function(player){
	player.Properties.Immortality.Value=true;
	timer=player.Timers.Get(immortalityTimerName).Restart(5);
});
Timers.OnPlayerTimer.Add(function(timer){
	if(timer.Id!=immortalityTimerName) return;
	timer.Player.Properties.Immortality.Value=false;
});

// ïîñëå êàæäîé ñìåðòè èãðîêà îòíèìàåì îäíó ñìåðòü â êîìàíäå
Properties.OnPlayerProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (context.Player.Team == null) return;
	context.Player.Team.Properties.Get("Deaths").Value--;
});
// åñëè â êîìàíäå êîëè÷åñòâî ñìåðòåé çàíóëèëîñü òî çàâåðøàåì èãðó
Properties.OnTeamProperty.Add(function(context, value) {
	if (value.Name !== "Deaths") return;
	if (value.Value <= 0) SetEndOfMatchMode();
});

// ñ÷åò÷èê ñïàâíîâ
Spawns.OnSpawn.Add(function(player) {
	++player.Properties.Spawns.Value;
});
// ñ÷åò÷èê ñìåðòåé
Damage.OnDeath.Add(function(player) {
	++player.Properties.Deaths.Value;
});
// ñ÷åò÷èê óáèéñòâ
Damage.OnKill.Add(function(player, killed) {
	if (killed.Team != null && killed.Team != player.Team) {
		++player.Properties.Kills.Value;
		player.Properties.Scores.Value += 100;
	}
});

// íàñòðîéêà ïåðåêëþ÷åíèÿ ðåæèìîâ
mainTimer.OnTimer.Add(function() {
	switch (stateProp.Value) {
	case WaitingStateValue:
		SetBuildMode();
		break;
	case BuildModeStateValue:
		SetGameMode();
		break;
	case GameStateValue:
		SetEndOfMatchMode();
		break;
	case EndOfMatchStateValue:
		RestartGame();
		break;
	}
});

// çàäàåì ïåðâîå èãðîâîå ñîñòîÿíèå
SetWaitingMode();

// ñîñòîÿíèÿ èãðû
function SetWaitingMode() {
	stateProp.Value = WaitingStateValue;
	Ui.GetContext().Hint.Value = "Ждем игроков";
	Spawns.GetContext().enable = false;
	mainTimer.Restart(WaitingPlayersTime);
}

function SetBuildMode() 
{
	stateProp.Value = BuildModeStateValue;
	BD.Ui.Hint.Value = "Защищайте зоны";
	var RD = Teams.Get("Red");
	RD.inventory.Main.Value = false;
	RD.inventory.Secondary.Value = false;
	RD.inventory.Melee.Value = false;
	RD.inventory.Explosive.Value = false;
	RD.inventory.Build.Value = false;

	mainTimer.Restart(BuildBaseTime);
	Spawns.GetContext().enable = true;
	SpawnTeams();
}
function SetGameMode() 
{
	stateProp.Value = GameStateValue;
	var RD = Teams.Get("Red");
    var BD = Teams.Get("Blue");
    RD.Ui.Hint.Value = "Захватите все зоны!";
    BD.Ui.Hint.Value = "Не дайте захватить все зоны!";

	if (GameMode.Parameters.GetBool("RAmmo")) {
		RD.inventory.Main.Value = true;
        RD.inventory.MainInfinity.Value = true;
		RD.inventory.Secondary.Value = true;
        RD.inventory.SecondaryInfinity.Value = true;
		RD.inventory.Melee.Value = true;
		RD.inventory.Explosive.Value = true;
		RD.inventory.Build.Value = false;
	} else {
		RD.inventory.Main.Value = true;
		RD.inventory.Secondary.Value = true;
		RD.inventory.Melee.Value = true;
		RD.inventory.Explosive.Value = true;
		RD.Inventory.Build.Value = true;
	}

    if (GameMode.Parameters.GetBool("BHealth")) {
		BD.contextedProperties.MaxHp.Value = 275;
	} else {
        BD.Ui.Hint.Value = "Не дайте захватить все зоны!"
	}

    if (GameMode.Parameters.GetBool("SkinZ")) {
		RD.contextedProperties.SkinType.Value = 1;
	} else {
        RD.Ui.Hint.Value = "Захватите все зоны!"
	}

	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Despawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "Hint/EndOfMatch";

	var spawns = Spawns.GetContext();
	spawns.enable = false;
	spawns.Despawn();
	Game.GameOver(LeaderBoard.GetTeams());
	mainTimer.Restart(EndOfMatchTime);
}
function RestartGame() {
	Game.RestartGame();
}

function SpawnTeams() {
	var e = Teams.GetEnumerator();
	while (e.moveNext()) {
		Spawns.GetContext(e.Current).Spawn();
	}
}
