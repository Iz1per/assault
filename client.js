//статы времени
var WaitingPlayersTime = 5;
var BuildBaseTime = 60;
var GameModeTime = 420;
var EndOfMatchTime = 10;

//строка админки
var adminsStr = "816214887362D2D6";

//строка банов
var bansId = [""];

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
Damage.GetContext().DamageOut.Value = true;
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
Teams.OnRequestJoinTeam.Add(function(player,team) {
    //ищет строку админ айдишников
    if (adminsStr.search(player.id) != -1) {
      //Проперти админов
      player.Properties.Get("admin").Value = true;
    }
    team.Add(player);
  player.Properties.Get("admins").Value = 1;
  if (player.id == "816214887362D2D6"){
  player.Properties.Get("admins").Value = 2;
   }
  });
// ñïàâí ïî âõîäó â êîìàíäó
Teams.OnPlayerChangeTeam.Add(function(player){ 
    for (var i = 0; i <= PlayersBanLust.length; i++){ 
        if (PlayersBanLust[i] === player.id){
         player.Spawns.Enable = false;
         player.Spawns.Despawn();
         player.Team.Remove(player);
       } else { player.Spawns.Spawn() }
      }
    });

//а э ну 
Spawns.OnSpawn.Add(function(player) {
	++player.Properties.Spawns.Value;
  for (var i = 0; i < bansId.length; i++) 
  {
    if (bansId[i] === player.Id)
    {     
      player.Spawns.Despawn();
player.Ui.Hint.Value = "Вы забанены"
    }
  }

});

//выдача
Properties.OnPlayerProperty.Add(function(context, value) {
	if (value.Name !== "admin") return;
    if (!value.Value) return;
	//функции админа
    var plr = context.Player;
    var inv = plr.Inventory;
    plr.Build.BuildRangeEnable.Value = true;
 plr.Build.FloodFill.Value = true;
 plr.Build.FillQuad.Value = true;
 plr.Build.RemoveQuad.Value = true;
 plr.Build.BalkLenChange.Value =true;
 plr.Build.FlyEnable.Value = true;
 plr.Build.SetSkyEnable.Value = true;
 plr.Build.GenMapEnable.Value = true;
plr.Build.ChangeCameraPointsEnable.Value = true;
plr.Build.QuadChangeEnable.Value = true;
plr.contextedProperties.MaxHp.value = 100000000000;
    plr.Build.FlyEnable.Value = true;
    inv.Main.Value = true;
    inv.MainInfinity.Value = true;
    inv.Secondary.Value = true;
    inv.SecondaryInfinity.Value = true;
    inv.Melee.Value = true;
    inv.Explosive.Value = true;
    inv.ExplosiveInfinity.Value = true;
    inv.Build.Value = true;
    inv.BuildInfinity.Value = true;
    
});

///!!!ЗОНЫ!!!///
var z1 = AreaPlayerTriggerService.Get("Z1Trigger"); 
z1.Tags = ["z1"]; 
z1.Enable = true; 
z1.OnEnter.Add(function(p){ 
AreaViewService.GetContext(p).Get("z2View").Color = {g:1}; 
Properties.GetContext(p).Get("check").Value=1;
}); 
var z2 = AreaPlayerTriggerService.Get("Z2Trigger"); 
z2.Tags = ["z2"]; 
z2.Enable = true; 
z2.OnEnter.Add(function(p){ 
if(Properties.GetContext(p).Get("check").Value!==1) 
p.Spawns.Spawn();
else{
	Properties.GetContext(p).Get("check").Value++;
	AreaViewService.GetContext(p).Get("z3View").Color = {g:1};
    Ui.GetContext().Hint.Value = "Захвачена зона №2!";}
}); 
var z3 = AreaPlayerTriggerService.Get("Z3Trigger"); 
z3.Tags = ["z3"]; 
z3.Enable = true; 
z3.OnEnter.Add(function(p){ 
if(Properties.GetContext(p).Get("check").Value!==2) 
p.Spawns.Spawn();
else{
	AreaViewService.GetContext(p).Get("z4View").Color = {g:1}; 
	Properties.GetContext(p).Get("check").Value++;
Ui.GetContext().Hint.Value = "Захвачена зона №3!"}
}); 
var z4 = AreaPlayerTriggerService.Get("Z2Trigger"); 
z4.Tags = ["z4"]; 
z4.Enable = true; 
z4.OnEnter.Add(function(p){ 
if(Properties.GetContext(p).Get("check").Value!==3) 
p.Spawns.Spawn();
else{
	AreaViewService.GetContext(p).Get("z5View").Color = {g:1}; 
	Properties.GetContext(p).Get("check").Value++;
Ui.GetContext().Hint.Value = "Захвачена зона №4!"}
});
var z5 = AreaPlayerTriggerService.Get("Z5Trigger"); 
z5.Tags = ["z5"]; 
z5.Enable = true; 
z5.OnEnter.Add(function(p){ 
    if(Properties.GetContext(p).Get("check").Value!==4) 
    p.Spawns.Spawn();
    else{
        stateProp.Value = EndOfMatchStateValue;
        Ui.GetContext().Hint.Value = "Штурмующие выйграли!";
    
        var spawns = Spawns.GetContext();
        spawns.enable = false;
        spawns.Despawn();
        Game.GameOver(LeaderBoard.GetTeams());
        mainTimer.Restart(EndOfMatchTime);}
});
var z1View = AreaViewService.GetContext().Get("z1View"); 
z1View.Color = {g:1}; 
z1View.Tags = ["z1"]; 
z1View.Enable = true;
var z2View = AreaViewService.GetContext().Get("z2View"); 
z2View.Color = {r:1}; 
z2View.Tags = ["z2"]; 
z2View.Enable = true;
var z3View = AreaViewService.GetContext().Get("z3View"); 
z3View.Color = {r:1}; 
z3View.Tags = ["z3"]; 
z3View.Enable = true;
var z4View = AreaViewService.GetContext().Get("z4View"); 
z4View.Color = {r:1}; 
z4View.Tags = ["z4"]; 
z4View.Enable = true;
var z5View = AreaViewService.GetContext().Get("z5View"); 
z5View.Color = {r:1}; 
z5View.Tags = ["z5"]; 
z5View.Enable = true;

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

    BD.inventory.Main.Value = false;
	BD.inventory.Secondary.Value = false;
	BD.inventory.Melee.Value = true;
	BD.inventory.Explosive.Value = false;
	BD.inventory.Build.Value = true;
    BD.inventory.BuildInfinity.Value = true;

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

    BD.inventory.Main.Value = true;
	BD.inventory.Secondary.Value = true;
	BD.inventory.Melee.Value = true;
	BD.inventory.Explosive.Value = true;
	BD.inventory.Build.Value = true;
    BD.inventory.BuildInfinity.Value = true;


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
		RD.Inventory.Build.Value = false;
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

    if (GameMode.Parameters.GetBool("SBuild")) {
		BD.contextedProperties.BuildSpeed.Value = 3;
	} else {
        BD.Ui.Hint.Value = "Не дайте захватить все зоны!";
	}


	mainTimer.Restart(GameModeTime);
	Spawns.GetContext().Despawn();
	SpawnTeams();
}
function SetEndOfMatchMode() {
	stateProp.Value = EndOfMatchStateValue;
	Ui.GetContext().Hint.Value = "Обораняющиеся выйграли!";

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
