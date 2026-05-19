package sms;

import io.javalin.Javalin;
import io.javalin.http.Context;
import static io.javalin.apibuilder.ApiBuilder.*;

import java.util.*;
import sms.Objects.ClassEntity;

public class ApiServer {

    static List<ClassEntity> classes = new ArrayList<>(Arrays.asList(
        new ClassEntity(1, "Math 101", 2026, 111),
        new ClassEntity(2, "Physics 101", 2026, 111)
    ));
    
    static int nextId = 3;
    
    public static void main(String[] args) {
        @SuppressWarnings("unused")
        Javalin app = Javalin.create(config -> {
            config.staticFiles.add(staticFiles -> {
                staticFiles.hostedPath = "/";
                staticFiles.directory = "/public";
            });
            
            config.routes.apiBuilder(() -> {
                get("/api/classes", ApiServer::getAllClasses);
                post("/api/classes", ApiServer::createClass);
                delete("/api/classes/{id}", ApiServer::deleteClass);
            });
        })
        .start(7070);

        System.out.println("Access at http://localhost:7070");
    }
    
    private static void getAllClasses(Context ctx) {
        ctx.json(classes);
    }
    
    private static void createClass(Context ctx) {
        try {
            ClassEntity payload = ctx.bodyAsClass(ClassEntity.class);

            ClassEntity newClass = new ClassEntity(
                nextId++,
                payload.getName(),
                payload.getYear(),
                payload.getCreatedBy()
            );
            classes.add(newClass);
            
            ctx.status(201);
            ctx.json(newClass);
        } catch (Exception e) {
            ctx.status(400);
            ctx.json(Collections.singletonMap("error", e.getMessage()));
        }
    }
    
    private static void deleteClass(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            classes.removeIf(c -> c.getId() == id);
            ctx.status(200);
            ctx.json(Collections.singletonMap("message", "Deleted"));
        } catch (Exception e) {
            ctx.status(400);
            ctx.json(Collections.singletonMap("error", e.getMessage()));
        }
    }
}