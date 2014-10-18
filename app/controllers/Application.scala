package controllers

import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.iteratee._
import play.api.libs.concurrent._
import play.api.libs.concurrent.Execution.Implicits._

object Application extends Controller {
  
  //val hubEnum = Concurrent.broadcast[JsValue]()
  //val hub = Concurrent.hub[JsValue]( hubEnum )
  val (clientEnum, channel) = Concurrent.broadcast[JsValue]

  var counter = 0;

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def stream = WebSocket.async[JsValue] { request =>
    var out = clientEnum;
    counter += 1
    var pid = counter;
    var in = Iteratee.foreach[JsValue](_ match {
      case message: JsObject => {
        channel push ( message++ JsObject(Seq("pid" -> JsNumber(pid))) )
      }
    })

    Promise.pure( (in, out) )
  }

}