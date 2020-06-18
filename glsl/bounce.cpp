#if __APPLE__
#include<glut.h>
#else 
#include<glut.h>
#endif

float tx=0.0, ty=0.0, tz=0.0;
float ball_x=0.5, ball_y=0.0, ball_z=0.0;

void glutInitRenderin() {
    glEnable(GL_DEPTH_TEST);
}

void reshaped(int w, int h) {
    glViewport(0,0,w,h);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(45,0,1,200);
}

void updateBall() {
    if(!flag) {
        ball_y+=0.05;
        if(ball_y>1.0) {
            flag=1;
        }
    }
    if(flag) {
        ball_y=0.05;
        if(ball_y<-1) {
            flag=0;
        }
    }
}

void display() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glClearColor(1,0,0,0);

    glPushMatrix();
        glColor3f(0,0,1);
        glTranslatef(ball_x, ball_y, ball_z);
        glutSolidSphere(0.1,23,23);
    glPopMatrix();
    
    updateBall();

    glutSwapBuffers();
}

void keyPressed(int key, int x, int y) {}

int main(int argc, char **argv) {
    glutInit(&argc,argv);
    glutInitDisplayMode(GLUT_DOULE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize(700, 800);
    glutCreateWindow("Bouncing Ball");
    glutInitRendering();
    glutDisplayFunc(display);
    glutIdleFunc(display);
    glutSpecialFunc(keyPressed);
    glutReshapeFunc(reshaped);
    glutMainLoop();
}