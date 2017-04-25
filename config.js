
//Was vor jede nachricht kommen soll (default: !)
//Kommando zum auflisten aller Befehle
exports.enableCommandsCommand = true
exports.commandsCommand = '!commands'

//DAS UPTIME COMMAND zu beachten: ist eigentlich die uptime des Bots
exports.uptimeCommand = '!uptime'
exports.enableUptimeCommand = true
exports.uptimeAccuracy = 3 //Die genauigkeit in Sekunden (Empfohlen aus Performancegründen: >1)

//Alle Frage->Antwort Befehle, links Befehl rechts Antwort
//eigentlich alles ziemlich offensichtlich, die Kommas hinter den Einträgen (außer beim letzten) nicht vergessen :)
//werden automatisch ins commands Command hinzugefügt.
/*
exports.messages = [
  ["delay", "2 Zwiebeln"],
  ["br", "Einige Zwiebeln $$$"],
  ["ping", "Pong!"],
  ["challenge", "120 $ auf 5000 $"],
  ["homegame", "Homegame ID: 2102861 PW membersonly2017"],
  ["playlist", "Random Sh!t auf Youtube!"],
  ["hilfe", "!commands in den Chat schreiben oder einfach in den Chat zwiebeln =)"]
]
*/



//Quotes werden bei Aufruf (default: !quotes) zufällig abgespielt (passiert schon mal das 3x das gleiche kommt #variance)
exports.quotesCommand = '!quotes'
exports.quotes = [

  '"Last night I stayed up late playing poker with Tarot cards. I got a full house and four people died." ~Steven Wright',
  'A on the River - Barry Greenstine'
]



//Greetz Duke
