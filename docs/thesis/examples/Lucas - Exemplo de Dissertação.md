## Page 1

&lt;img&gt;TÉCNICO LISBOA logo with blue shield and white 'IT' symbol&lt;/img&gt;

&lt;img&gt;Soccer stadium with players on field&lt;/img&gt;

# Football Intensive Data Extractor Goal Replay Analysis:
## Scoring Method and Play Classification

**Lucas Figueiredo Leitão**

Thesis to obtain the Master of Science Degree in

**Master Programme in Telecommunications and Informatics**

Supervisors: Prof. Guilherme Henrique Caçador Ramos
Prof. Daniel de Matos Silvestre

**Examination Committee**

Chairperson: Prof. Luís Eduardo Teixeira Rodrigues
Supervisor: Prof. Guilherme Henrique Caçador Ramos
Member of the Committee: Prof. Sérgio Daniel Gonçalves Melo Pequito

November 2025

---


## Page 2

This work was created using LaTeX typesetting language in the Overleaf environment (www.overleaf.com).

---


## Page 3

# Declaration

I declare that this document is an original work of my own authorship and that it fulfills all the requirements of the Code of Conduct and Good Practices of the Universidade de Lisboa.

---


## Page 4

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 5

# Acknowledgments

I would like to thank my parents, my godmother, my sister, and my brother for their friendship, encouragement and caring over all these years, for always being there for me through thick and thin, and without whom this project would not be possible. I would also like to thank my grandparents, aunts, uncles, and cousins for their understanding and support throughout all these years.

I would like to express my deepest gratitude to the company Six Floor Solutions for suggesting the theme of this thesis and for their invaluable support throughout its development. Their guidance and resources have been instrumental in shaping this work, providing me with opportunities to learn and grow. A special thanks goes to Xavier Frazão from Six Floor Solutions, whose expertise, encouragement, and constructive feedback have been pivotal in accomplishing this project.

I would also like to acknowledge my dissertation supervisors, Prof. Daniel de Matos Silvestre and Prof. Guilherme Henrique Caçador Ramos, for their insight, support, and sharing of knowledge that has made this thesis possible.

Last but not least, to all my friends and colleagues who helped me grow as a person and were always there for me during the good and bad times in my life.

To each and every one of you – thank you.

This work is funded by national funds through FCT – Fundação para a Ciência e a Tecnologia, I.P., and, when eligible, co-funded by EU funds under project/support UID/50008/2025 – Instituto de Telecomunicações, with DOI identifier https://doi.org/10.54499/UID/50008/2025.

&lt;page_number&gt;i&lt;/page_number&gt;

---


## Page 6

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 7

# Abstract

Football's global popularity has driven major technological advancements, yet automating detailed goal analysis remains a challenge. Inconsistent camera angles, diverse goal types, and frequent player occlusion complicate the accurate analysis of scoring events.

This thesis introduces an AI-powered system that addresses these challenges by combining computer vision and machine learning techniques. The system detects both abrupt and gradual video transitions, segments replay footage into individual camera shots, and filters out irrelevant content such as celebrations.

Relevant camera shots are then used to track the ball and players, identify touches, and apply pose estimation to determine the body part responsible for scoring. The system also classifies the type of play leading to each goal, distinguishing between open play and set pieces like corners, free kicks, and penalties. By correlating information across multiple frames and camera shots, the system improves the confidence and accuracy of its analysis.

By automating this process, the proposed system aims to reduce reliance on manual methods, minimize human error, and provide a consistent, efficient, and scalable solution for analyzing football matches. The insights derived from this approach can have applications beyond match reviews, potentially benefiting coaching, player performance evaluations, and the development of data-driven strategies.

# Keywords

AI-powered analysis, Computer Vision, Shot Boundaries, Image Classification, Object Detection, Pose Estimation

&lt;page_number&gt;iii&lt;/page_number&gt;

---


## Page 8

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 9

# Resumo

A popularidade global do futebol impulsionou grandes avanços tecnológicos, mas a automação da análise detalhada de golos continua a ser um desafio. Ângulos de câmara inconsistentes, tipos de golos diversos e a frequente obstrução de jogadores complicam a análise precisa dos eventos de golo.

Esta tese apresenta um sistema suportado por inteligência artificial que aborda estes desafios, combinando técnicas de visão computacional e aprendizado de máquina. O sistema detecta transições de vídeo abruptas e graduais, segmenta as repetições em planos de câmara individuais e filtra conteúdos irrelevantes, como celebrações.

As perspetivas de câmara relevantes são então utilizadas para rastrear a bola e os jogadores, identificar toques e aplicar estimativa de pose para determinar a parte do corpo responsável pelo golo. O sistema também classifica o tipo de jogada que leva a cada golo, distinguindo entre jogadas longas e lances parados, como cantos, livres e penáltis. Ao correlacionar informações através de múltiplos quadros de vídeo e perspetivas de câmara, o sistema melhora a credibilidade e a precisão da sua análise.

Ao automatizar este processo, o sistema proposto visa reduzir a dependência de métodos manuais, minimizar erros humanos e fornecer uma solução consistente, eficiente e escalável para a análise de partidas de futebol. As informações derivadas desta abordagem podem ter aplicações além das análises de partidas, beneficiando potencialmente o treino, as avaliações de desempenho dos jogadores e o desenvolvimento de estratégias baseadas em dados.

# Palavras Chave

Análise baseada em IA, Visão Computacional, Transições de Perspetivas de Câmera, Classificação de Imagens, Deteção de Objetos, Estimação de Pose

&lt;page_number&gt;v&lt;/page_number&gt;

---


## Page 10

&lt;img&gt;A close-up photograph of a person's hand holding a small, dark, shiny object between their thumb and index finger. The background is out of focus.&lt;/img&gt;

---


## Page 11

# Contents

1 Introduction 1
    1.1 Context and Motivation 4
    1.2 Objectives 4
    1.3 Challenges 4
    1.4 Contributions 5
    1.5 Organization of the Document 6
2 Background 7
    2.1 Emergence of Technology in Football 9
    2.2 Shot Boundary Detection 10
        2.2.1 Traditional Methods 10
        2.2.2 Feature-based Approaches 11
        2.2.3 Deep Learning Methods 11
        2.2.4 Football-specific Techniques 12
    2.3 Shot Classification 12
        2.3.1 Spatial Feature-based Methods 13
        2.3.2 Color-based Classification 13
        2.3.3 Multi-feature Approaches 13
        2.3.4 Deep Learning Methods 13
    2.4 Play Classification 14
        2.4.1 Rule-based Approaches 14
        2.4.2 Feature-based Methods 15
        2.4.3 Deep learning Approaches 15
    2.5 Goal Classification 16
        2.5.1 Player and Ball Detection 16
        2.5.2 Pose Estimation 17
        2.5.3 Posture Analysis 17
        2.5.4 Action Analysis 18

---


## Page 12

2.6 Noteworthy Works . . . . . 19
2.6.1 Field Analysis . . . .19
26.2 Color-Based Clustering . . . .20
2.63 Integrated Approaches and Multi-modal Analysis . . .21
3 Architecture . . . . . 21
3.1 Input Specifications . . . . ..23
3.2 Functional and Coverage Requirements . . . . ...23
33 System Architecture . . . ... 24
4 Implementation . . . . ....... 27
4.1 Shot Detection . . . . . 29
4.1.1 Solution . . . . ..29
41.2 Other Approaches . . . . ...30
4.2 Shot Classification . . . . ....31
4.3 Play Classification . . . ... 32
4.3.1 Solution . ... 33
4.32 Other Approaches ... 33.
4.4 Goal Classification . . . .... 33
&lt;page_number&gt;43&lt;/page_number&gt;
5 Evaluation . . . . . 43
5.1 Test Dataset . . . . ... 45
5.2 Metrics . . . . ....... 46
5.3 Experimental Setup . . . ...47
5.4 Results . . . . ..... 47
54.1 Goal Classification . . . ... ... 47
&lt;page_number&gt;48&lt;/page_number&gt;
5.4.2 Play Classification . . . . ... 50
5.4.3 System Performance Summary . . . ...51
6 Conclusion . . . . ....... 53
6.1 Conclusions . . . . . 55
6.2 System Limitations . . . . ..55
63 Future Work . . . . ... 56

&lt;page_number&gt;viii&lt;/page_number&gt;

---


## Page 13

Bibliography

&lt;page_number&gt;59&lt;/page_number&gt;

ix

---


## Page 14

x

---


## Page 15

# List of Figures

3.1 The architecture of the proposed solution showing its main components: shot detector and classifier, play classifier, and goal classifier, along with their interactions. . . . . . 24

4.1 Classification of camera shots into long, medium, close, and audience categories based on the distance to the play or content of the shot, following the detection of transition boundaries. . . . 31

4.2 Detailed logic of the goal classifier component. . . . . .  . 34

4.3 YOLOv11 Object Detection: Bounding boxes with class labels and confidence scores positioned above [1]. . . . .   . 34
4.4 Field detection with lines connecting keypoints that correspond to the soccer field lines and goal frame [2]. . . . 36

4.5 Illustration of touch detection analysis. . . . . .  . 37

4.6 Object detection and tracking in a touch occurrence. . . .  37

&lt;img&gt;4.7 Visualization of pose estimation using Ultralytics YOLOv11 [3], with each detection labeled by its class and confidence score.&lt;/img&gt; 38

4.8 Keypoint decision tree according to pose and ball movement on a touch occurrence. . . . 40

4.9 Decision tree to determine whether a keypoint is probable as the body part responsible for scoring the goal or inconclusive. If deemed probable, it calculates the confidence based on the results from all long and medium camera shots. . . . . .  41

5.1 Shot classifier confusion matrix. . . . 48

5.2 Play classifier confusion matrix. 51

&lt;page_number&gt;xi&lt;/page_number&gt;

---


## Page 16

xii

---


## Page 17

# List of Tables

<table>
  <tr>
    <td>5.1</td>
    <td>Games and total goals by league in the test dataset.</td>
    <td>45</td>
  </tr>
  <tr>
    <td>5.2</td>
    <td>Games and total goals by league used in the shot classification and goal classification analysis.</td>
    <td>46</td>
  </tr>
  <tr>
    <td>5.3</td>
    <td>Distribution of different types of shots in the smaller dataset (45 games).</td>
    <td>48</td>
  </tr>
  <tr>
    <td>5.4</td>
    <td>Distribution of different types of plays in the dataset (86 games).</td>
    <td>50</td>
  </tr>
  <tr>
    <td>5.5</td>
    <td>Precision of each component and their classes.</td>
    <td>51</td>
  </tr>
</table>

&lt;page_number&gt;xiii&lt;/page_number&gt;

---


## Page 18

xiv

---


## Page 19

# Acronyms

<table>
  <tr>
    <td>SPC</td>
    <td>Soccer Pitch Color</td>
  </tr>
  <tr>
    <td>VAR</td>
    <td>Video Assistant Referee</td>
  </tr>
  <tr>
    <td>GLT</td>
    <td>Goal-Line Technology</td>
  </tr>
  <tr>
    <td>AI</td>
    <td>Artificial Intelligence</td>
  </tr>
  <tr>
    <td>fps</td>
    <td>Frames per Second</td>
  </tr>
  <tr>
    <td>FA</td>
    <td>Football Association</td>
  </tr>
  <tr>
    <td>FIFA</td>
    <td>Fédération Internationale de Football Association</td>
  </tr>
  <tr>
    <td>SURF</td>
    <td>Speeded-Up Robust Features</td>
  </tr>
  <tr>
    <td>VAE</td>
    <td>Variational Autoencoder</td>
  </tr>
  <tr>
    <td>SORT</td>
    <td>Simple Online and Realtime Tracking</td>
  </tr>
  <tr>
    <td>CSRT</td>
    <td>Channel and Spatial Reliability Tracker</td>
  </tr>
  <tr>
    <td>ROI</td>
    <td>Region of Interest</td>
  </tr>
  <tr>
    <td>YOLO</td>
    <td>You Only Look Once</td>
  </tr>
  <tr>
    <td>MOT</td>
    <td>Multiple Object Tracking</td>
  </tr>
  <tr>
    <td>CV</td>
    <td>Computer Vision</td>
  </tr>
  <tr>
    <td>SBD</td>
    <td>Shot Boundary Detection</td>
  </tr>
  <tr>
    <td>PSNR</td>
    <td>Peak Signal-to-Noise Ratio</td>
  </tr>
  <tr>
    <td>MSSIM</td>
    <td>Mean Structural Similarity Index</td>
  </tr>
  <tr>
    <td>SAHI</td>
    <td>Slicing Aided Hyper Inference</td>
  </tr>
  <tr>
    <td>WASB-SBDT</td>
    <td>Widely Applicable Strong Baseline for Sports Ball Detection and Tracking</td>
  </tr>
  <tr>
    <td>TP</td>
    <td>True Positive</td>
  </tr>
  <tr>
    <td>FP</td>
    <td>False Positive</td>
  </tr>
  <tr>
    <td>SVM</td>
    <td>Support Vector Machine</td>
  </tr>
</table>

&lt;page_number&gt;xv&lt;/page_number&gt;

---


## Page 20

CNN Convolutional Neural Network

&lt;page_number&gt;xvi&lt;/page_number&gt;

---


## Page 21

# 1

# Introduction

## Contents

<table>
  <tr>
    <td>1.1 Context and Motivation</td>
    <td>4</td>
  </tr>
  <tr>
    <td>1.2 Objectives</td>
    <td>4</td>
  </tr>
  <tr>
    <td>1.3 Challenges</td>
    <td>4</td>
  </tr>
  <tr>
    <td>1.4 Contributions</td>
    <td>5</td>
  </tr>
  <tr>
    <td>1.5 Organization of the Document</td>
    <td>6</td>
  </tr>
</table>

&lt;page_number&gt;1&lt;/page_number&gt;

---


## Page 22

2

---


## Page 23

Football, also known as soccer in some regions, has a rich history spanning centuries. As one of the most popular sports in the world [4], it captivates billions of fans across diverse cultures and continents [5]. This widespread enthusiasm can be traced back to the formation of the Football Association (FA) in London in 1863, which established the first official set of rules known as the “Laws of the Game” [6]. The creation of this association marked a significant milestone in standardizing the sport and distinguishing it from other forms of football, such as rugby.

As soccer grew in popularity, it spread rapidly across Europe and South America in the late 19th and early 20th centuries [7]. In response to this growing interest, the Fédération Internationale de Football Association (FIFA) was founded in 1904 to oversee international competition, further solidifying football’s global presence [8].

Based on this sustained popularity, football has seen a substantial increase in technological investments. Leagues and clubs have adopted a range of advanced systems designed to enhance both the spectator experience and the game’s integrity [9]. Video Assistant Referee (VAR) systems, player performance trackers, goal-line technology, and real-time analytics are some of the innovations that are enhancing the sport [10], emphasizing the role of technology in maintaining football’s status as one of the world’s most influential sports.

Although researchers have made significant progress, the automation of more complex analyses, such as in-depth goal analysis, presents considerable obstacles [11, 12] and remains mainly manual, making it time-consuming and susceptible to human error.

Regardless of the goal analysis being automated or manual, it can be equally valuable for coaches, analysts, and broadcasters, as it may provide insights into team strategies and player performance [10]. Moreover, examining specific types of goals a team achieves and identifying the top goal scorer makes it possible to pinpoint crucial offensive trends [13]. Furthermore, understanding how players typically score, either with their left foot, knee, head, or other body part, provides a solid grasp of their goal-scoring capabilities [13].

However, the automated analysis of goal replays in football faces several significant challenges due to the sport’s fast-paced and complex nature. Consequently, according to my research (see Section 2.5), goal analysis remains a relatively unexplored area, with most existing efforts concentrated on specific aspects, such as detecting when a goal is scored [14] or positional analysis by tracking the ball and the movement of players [15].

&lt;page_number&gt;3&lt;/page_number&gt;

---


## Page 24

# 1.1 Context and Motivation

I am developing this thesis in collaboration with Six Floor Solutions¹, a technology company focused on innovating media consumption experiences. One of their products focuses on sports media, leveraging automatic video processing technologies to detect pivotal moments across various sports. Particularly in football, it highlights critical events, such as goals, fouls, and dangerous plays, enabling users to access and experience these moments. This thesis, building on their existing expertise in analyzing football, seeks to potentially expand their product by extracting comprehensive information about the detected goals.

# 1.2 Objectives

This work proposes an Artificial Intelligence (AI) powered solution that integrates computer vision techniques and machine learning algorithms to automate goal analysis in football.

The primary objective of this solution is to develop capabilities for identifying essential aspects of goal events. These aspects include determining the body part used to score the goal (right foot, left foot, or head) and classifying the type of play leading up to the goal (long play, corner kick, penalty, or free kick).

Ultimately, the purpose is to create a comprehensive tool for analyzing football goal replays using computer vision and machine learning technologies. This tool should accurately identify shot² transitions, detect touches, determine the keypoint (or body part) involved in those touches, and classify the type of play that led to the goal.

# 1.3 Challenges

Football's dynamic and unpredictable nature, combined with the variability of video footage, brings significant complexity to automated goal analysis. Unlike controlled environments, football matches are filmed from multiple camera angles, each with different zoom levels and perspectives. This diversity leads to inconsistencies in how scoring moments are captured, making it difficult to apply uniform analysis techniques and complicating the reliable tracking of ball movement and player actions.

Another major challenge comes from the structure of broadcast replays. These replays sometimes focus on incidents leading up to the goal, such as fouls or tactical build-ups, or they may end with scenes of players celebrating rather than showing the actual scoring moment.

---
¹A tech company dedicated to revolutionizing the media consumption experience: https://www.sixfloorsolutions.com/
²In this thesis, the term “shot” always refers to a camera shot.

&lt;page_number&gt;4&lt;/page_number&gt;

---


## Page 25

Additionally, the presence of multiple players around the ball can obstruct the camera's view, hiding the ball or the decisive action at critical moments. This frequent occlusion not only complicates the detection of the goal moment but also makes it harder to identify which player and which part of their body was involved in the scoring action.

Given these challenges, any automated approach must be flexible enough to handle a wide range of play types, from long-range kicks to close-range finishes and from ground-level to aerial plays. It must also be able to filter out irrelevant or misleading footage and intelligently manage situations where the view is obstructed or incomplete. Addressing these issues is essential for developing a robust and reliable system for automated football goal analysis.

## 1.4 Contributions

This thesis aims to contribute to the field of sports analytics, particularly in the automated analysis of goals in football matches, which are pivotal moments in the game.

A key contribution is the development and training of an image classification model specifically designed to categorize camera shots into three types: long, medium, and other. The “other” category includes shots irrelevant to goal analysis, such as audience reactions, close-ups of players after a goal, or the coach’s reaction on the bench. This filtering ensures that only critical moments are analyzed, reducing unwanted data and improving the accuracy of subsequent processing steps.

Building on this, a second image classification model was trained to classify the play leading to the goal, primarily using the frame representative of the first second of a relevant shot. This model can distinguish between long plays, free kicks, corners, and penalties, allowing the automatic categorization of goal origins.

Another significant contribution is an algorithm that reconstructs the most probable path of the ball by connecting segments of detected ball positions, even when the ball is temporarily lost due to obstructions or when false positives occur. This reconstruction is essential for ensuring that touch analysis is based on the most complete trajectory possible.

For the detection and analysis of ball touches, the system uses logic based on the bounding boxes of players and the ball to identify moments of contact. For each detected touch, three frames are extracted (before, during, and after the touch) and analyzed using pose estimation. Additional logic determines which keypoint (body part) most likely initiated the touch, allowing the system to automatically identify whether a goal was scored with the left foot, right foot, head, or another body part.

Additionally, this work seeks to demonstrate the feasibility of near-real-time analysis of football goal replays. Such capabilities could enable applications like instant detailed goal analysis during live broadcasts or immediate post-match reviews.

&lt;page_number&gt;5&lt;/page_number&gt;

---


## Page 26

In conclusion, this automated analysis aims to provide a level of detail and consistency that would be time-consuming to achieve through manual review alone. It seeks to enhance the quality and speed of goal analysis in professional football by delivering rapid, precise, and quantifiable insights from video data. Additionally, it introduces new methods for segmenting, classifying, and interpreting critical football events. The resulting system has the potential to significantly impact tactical decision-making, player performance evaluations, and broadcast commentary. Moreover, its applications could extend beyond football, benefiting other sports and various video analysis domains.

## 1.5 Organization of the Document

This document is organized into six chapters. Chapter 1 introduce the context and motivation behind the project, outline the main objectives, discuss the challenges involved, and summarize the key contributions of this thesis. Chapter 2 provides the necessary background, reviewing related work and describing the fundamental concepts and technologies that underpin the proposed solution. In Chapter 3, the architecture of the system is presented, including the system's requirements and the overall design. Chapter 4 details the implementation, explaining how each component of the system was developed. Chapter 5 focuses on evaluating the system, describing the dataset, metrics, and experimental setup, and presenting the results obtained. Finally, Chapter 6 concludes the thesis with a summary of the main findings, a discussion of the system's limitations, and suggestions for future work.

&lt;page_number&gt;6&lt;/page_number&gt;

---


## Page 27

# 2

# Background

## Contents

<table>
  <tr>
    <td>2.1</td>
    <td>Emergence of Technology in Football</td>
    <td>9</td>
  </tr>
  <tr>
    <td>2.2</td>
    <td>Shot Boundary Detection</td>
    <td>10</td>
  </tr>
  <tr>
    <td>2.3</td>
    <td>Shot Classification</td>
    <td>12</td>
  </tr>
  <tr>
    <td>2.4</td>
    <td>Play Classification</td>
    <td>14</td>
  </tr>
  <tr>
    <td>2.5</td>
    <td>Goal Classification</td>
    <td>16</td>
  </tr>
  <tr>
    <td>2.6</td>
    <td>Noteworthy Works</td>
    <td>19</td>
  </tr>
</table>

&lt;page_number&gt;7&lt;/page_number&gt;

---


## Page 28

8

---


## Page 29

This chapter is organized into seven sections. Section 2.1 provides background on the emergence and development of technology in football. Sections 2.2 to 2.5 present foundational works related to the four core components of this thesis: shot boundary detection, shot classification, play classification, and goal classification. Finally, Section 2.6 highlights additional methods and studies that, while not implemented in this thesis, may be considered for future integration to further enhance the system's performance and analytical capabilities.

## 2.1 Emergence of Technology in Football

Football analysis has traditionally relied on human observation and subjective interpretation, with coaches, analysts, and commentators manually reviewing match footage to assess team and player performance. While valuable, this method is often time-consuming and susceptible to human error and bias. As a result, football analysis has increasingly integrated technology to improve both accuracy and efficiency. Some examples are:

*   **Goal-Line Technology (GLT):** Officially approved by FIFA in 2012, this technology uses either camera-based systems or magnetic field technology to determine if the ball has fully crossed the goal line. GLT provides an instant decision (within one second) to the referee via a signal on their watch [16]. This technology has effectively eliminated controversies like the “ghost-” or “phantom-goal”, which refer to awarded goals that were not scored [17]. GLT is now widely used in top European leagues and major international competitions [18].
*   **Video Assistant Referee (VAR):** VAR was introduced more recently than GLT, becoming widely implemented in the late 2010s. It allows off-field officials to review decisions made by the head referee using video footage. It can be used for four types of decisions: goals (and violations in the build-up to goals), penalties, direct red cards, and cases of mistaken identity. Unlike GLT, which provides an automatic decision, VAR still involves human interpretation of video evidence. The VAR team communicates with the on-field referee, who can then review the footage on a pitch-side monitor before making a final decision [19].
*   **Advanced Analytics:** The rise of big data and analytics has revolutionized various aspects of football. Teams now use sophisticated statistical models and machine learning algorithms to analyze vast amounts of match data. This analysis aims to achieve multiple objectives, including the following:
    *   Performance Analysis: Tracking player movements, pass completion rates, goal conversion rate, and other metrics to evaluate individual and team performance.
&lt;page_number&gt;9&lt;/page_number&gt;

---


## Page 30

- Tactical Analysis: Using data to enhance game strategies, formation choices, and in-game decisions.
- Player Recruitment: Employing data-driven approaches to identify potential player additions based on performance metrics and fit with team strategies.

These advanced analytics tools have become integral to many professional clubs' operations, influencing everything from training methods to transfer decisions [20].

Building on this technological foundation, current research focuses on even more sophisticated automated analysis methods. In recent years, the field of automated football analysis has evolved rapidly. Computer vision techniques are now employed to track player movements and ball trajectories in real-time [15]. Additionally, machine learning algorithms are being developed to analyze complex patterns in gameplay, potentially offering insights that human observers may miss [21].

These technological advancements aim to provide more objective, data-driven insights into the game, complementing traditional analysis methods or even replacing them [20]. As football increasingly adopts technology, automated analysis has the potential to improve understanding of the game, enhance decision-making, and enrich the viewer experience.

## 2.2 Shot Boundary Detection

Shot boundary detection, the process of identifying transitions between different camera shots, is fundamental for comprehensive sports video analysis. In football, accurate detection enables detailed examination of gameplay from multiple perspectives, enriching tactical and performance insights.

Football video footage typically contains two main types of shot transitions: abrupt and gradual, especially dissolves. Abrupt transitions, or hard cuts, are marked by a rapid shift in visual content with only a single frame separating two shots. Dissolve transitions, on the other hand, unfold gradually as one shot fades out and another fades in, with both shots briefly overlapping and partially visible at the same time [22].

### 2.2.1 Traditional Methods

Early techniques for detecting these boundaries primarily relied on comparing the pixel intensity values of neighboring frames [23]. While these approaches are intuitive, they are highly susceptible to errors, as camera or subject movement may be mistaken for true shot boundaries.

To address some of these limitations, histogram-based methods were introduced [24]. By assessing the similarity between color or grayscale histograms of consecutive frames, these methods reduce

&lt;page_number&gt;10&lt;/page_number&gt;

---


## Page 31

sensitivity to spatial movement. However, scenes that differ significantly can sometimes yield similar histograms, resulting in undetected boundaries.

### 2.2.2 Feature-based Approaches

To enhance robustness, Miller *et al.* introduced edge-based methods [25]. These techniques focus on comparing edge features, such as contours and boundaries, instead of relying on pixel values or color distributions across frames. This approach offers greater resilience to lighting variations; however, it can result in false detections in high-motion scenarios, as abrupt transitions in edge patterns may be misinterpreted as shot boundaries.

Subsequent research explored more sophisticated features. For example, Hilbert transforms combined with discrete wavelet transforms have demonstrated the ability to generate new feature spaces that retain phase information and are less affected by both motion and illumination changes, making them particularly effective for abrupt transition detection [26].

In another approach, Birinci and Kiranyaz developed a keypoint-based algorithm using Speeded-Up Robust Features (SURF) feature detector and descriptor for shot boundary detection [27]. Their method analyzes the number of matched keypoints between sampled frames to accurately detect shot boundaries. However, this technique can be vulnerable to false positives caused by frame blurring and may miss boundaries in low-contrast or low-intensity frames.

To overcome the limitations of single-feature methods, hybrid methods that combine pixel-based, luminance-based, and motion-based metrics have proven effective in detecting both abrupt and gradual transitions, offering a balanced performance across diverse video content [28].

### 2.2.3 Deep Learning Methods

More recently, with the rise of deep learning, Convolutional Neural Networks (CNNs) have become prominent for shot boundary detection [29]. Approaches such as those from Baraldi *et al.* [30] utilize deep siamese architectures, which are neural networks consisting of two identical subnetworks sharing weights, designed to compare pairs of inputs by learning a similarity metric between them. This architecture excels at tasks like matching or distinguishing frames. Further, these models generate frame features that are grouped using spectral clustering, an unsupervised method based on graph theory that partitions data points by their similarities, making it well-suited to the complexity of video data.

Advancing beyond 2D CNNs, methods based on 3D convolutions [31] extend kernel operations over both spatial and temporal dimensions, thereby capturing motion and frame-to-frame dependencies essential for video analysis, as it enables processing of contiguous frames rather than merely individual images.

&lt;page_number&gt;11&lt;/page_number&gt;

---


## Page 32

Further building on these advances, innovations like TransNet [32] employ dilated 3D convolutions. In these convolutions, filters are spaced apart (dilated), which increases the model’s receptive field without raising the number of parameters or computational cost. In effect, dilated convolutions allow the network to aggregate information from a broader context within both spatial and temporal domains, capturing long-range dependencies and improving detection accuracy for shot boundaries.

This progression has resulted in advanced open-source models like TransNetV2 [29]. This architecture not only achieves state-of-the-art detection accuracy but is also optimized for speed and scalability, making it particularly suitable for processing large-scale video datasets.

### 2.2.4 Football-specific Techniques

While the previously discussed methods are designed to perform in general video scenarios, we also explored football-specific techniques developed specifically for detecting shot transitions in soccer videos. These techniques are tailored to the sport’s distinctive visual characteristics, such as rapid player movements, dynamic camera panning, and the homogeneous green coloring of the pitch. For example, Bayat et al. [14] proposed methods based on analyzing variations in green color ratios and color intensity, leveraging the predominance of the football field and common camera shot compositions typical of soccer broadcasts.

### 2.3 Shot Classification

Following shot boundary detection, the next critical step involves classifying each camera shot to identify segments relevant for goal analysis. This classification filters out auxiliary content such as player celebrations, crowd reactions, and tactical discussions, allowing the system to focus on shots containing actual gameplay.

In football video analysis, several standard shot categories are commonly used to distinguish primary gameplay from supplementary content [14,33–35]. The most common shot categories include the following:

*   Long/field shots: wide views showing most of the pitch;
*   Medium/Middle shots: focused views of specific field areas;
*   Close-up shots: player faces, details, or celebrations;
*   Audience shots: crowd reactions and stadium views.

These categories support precise separation between gameplay and contextual footage, facilitating more accurate and meaningful video analysis.

&lt;page_number&gt;12&lt;/page_number&gt;

---


## Page 33

# 2.3.1 Spatial Feature-based Methods

Early work by Ekin *et al.* (2003) introduced a spatial feature-based approach, dividing shots into “long shots”, “In-field medium shots”, and “out-of-field or close-up shots”. This method leveraged field detection by identifying the presence and extent of grass to distinguish between shot classes [33].

Building on these ideas, Zhou *et al.* (2005) developed a Support Vector Machine (SVM) classifier to categorize shots as “long”, “medium”, or “close-up or others”. Their approach extracted features such as color distribution, edge distribution, and shot duration, and employed a three one-against-other SVMs training scheme for shot classification [34]. In this scheme, three separate support vector machine classifiers were trained, each distinguishing one shot category from the other two (also known as one-vs-all), using the extracted features, and the final class label for each shot was determined by combining their outputs.

# 2.3.2 Color-based Classification

While spatial features provided a foundation for shot classification, researchers soon recognized that color information could offer additional discriminative power. For example, Fang Tian and Ping Shi (2013) used the ratio of Soccer Pitch Color (SPC) pixels, calculated from color histograms, to classify shots as “field shot”, “medium shot”, “close-up shot”, or “audience shot”. Field and medium shots typically contained a high and an average proportion of SPC pixels, respectively, while close-ups and audience shots did not. To further distinguish between close-ups and audience shots, edge detection (using the Sobel operator) was employed, since audience shots tend to exhibit higher edge density compared to close-ups [35].

# 2.3.3 Multi-feature Approaches

Similarly, Bayat *et al.* (2014) proposed a multi-feature method that classifies shots into “far”, “middle”, “close”, and “audience” categories. Their approach combines the green color ratio, blob area ratio (measuring non-green regions), and edge density from Canny edge detection to enhance classification accuracy [14].

# 2.3.4 Deep Learning Methods

More recently, deep learning approaches have further advanced shot type classification. Sarkhoosh *et al.* (2024) trained a specialized neural network to categorize each frame as a “full”, “long”, or “medium” camera shot, facilitating a comprehensive and insightful overview of important game events [36].

&lt;page_number&gt;13&lt;/page_number&gt;

---


## Page 34

These classification approaches demonstrate an evolution from simple spatial features to sophisticated multi-modal systems. However, football-specific challenges, such as varying lighting conditions and camera angles, continue to require specialized adaptations of these general techniques.

## 2.4 Play Classification

Although this work focuses on goal scenarios, most existing play classification methods are designed for broader usage across an entire match. In goal replays, the first shot typically presents an uninterrupted, wide-angle view of the play leading up to the goal, capturing players’ positioning, ball movement, and tactical buildup. This consistent visual structure makes such replays especially valuable for analyzing and categorizing the sequence of play leading to goals, such as a long buildup, or specific set pieces like free kicks, corners, and penalties.

### 2.4.1 Rule-based Approaches

Early rule-based systems highlighted the use of scene context and direct visual cues. For instance, in 2009, Ying Li *et al.* began incorporating ball and field detection to distinguish between different set pieces, such as corner kicks, free kicks, and penalties [37]. Their method first analyzed the camera movement to determine whether the scene was static or in slow motion (the typical conditions for set pieces). The process started by detecting the green field area from the global shot, followed by multi-cue ball detection. If the ball was not visible, the scene was likely a corner kick. If the ball was detected, a Hough transform was used to identify field lines (this technique is designed to robustly detect straight lines within an image, making it well-suited for highlighting football pitch markings). The presence and position of these lines, in relation to the ball, helped differentiate between free kicks and penalties.

More recently, Vidal-Codina *et al.* (2022) proposed a rule-based method using tracking data¹ to classify set-piece events such as kick-offs, penalties, goal kicks, and corners [38]. Since the vertical dimension (z-coordinate) of the ball in these tracking data providers was not always available, only 2D data was used. The game status was evaluated either explicitly, via flags such as a “dead ball” boolean, or implicitly by the absence of ball tracking data. Event detection rules were then built around player positioning, for example, a kick-off required all players in their own half and at least one near the center circle, while a penalty was indicated by only two players, the kicker and the goalkeeper, positioned near the spot, with others outside the penalty area. Similar spatial logic applied to corner and goal kick identification, enabling robust set-piece recognition from tracking data alone.

---
¹The data included 2D coordinates of all players and the ball, sampled at 25 Hz, from sources like Track160, Tracab, and Hawk-Eye.

&lt;page_number&gt;14&lt;/page_number&gt;

---


## Page 35

# 2.4.2 Feature-based Methods

Supervised learning brought a more systematic approach to play classification. Duan *et al.* (2002), in one of the earliest studies, used a multi-level framework for classifying video shots. Initially, they extracted low-level features, such as motion vectors and textures, directly from compressed video data. To support more refined analysis, I-frames (intra-coded frames), which are part of a video compression technique known as intra-frame coding, were decompressed for detailed spatial segmentation. Unlike predictive frames that store only differences from previous frames, I-frames contain a complete image, making them well-suited for tasks requiring accurate object and region detection. Following this, camera motion analysis and spatial segmentation, based on color and texture, were used to derive mid-level features, including dominant object motion, camera motion patterns, and homogeneous image regions. These were then mapped to high-level semantic categories, which a supervised classifier used to assign play labels based on learned rules [39].

# 2.4.3 Deep learning Approaches

In 2021, Karimi *et al.* introduced a deep learning-based method using two CNNs and a Variational Autoencoder (VAE) to classify soccer events [40]. A VAE is a generative model that learns a lower-dimensional representation (latent space) of input images and attempts to reconstruct them. Images resembling the training data result in low reconstruction loss, while unusual or unfamiliar frames yield higher loss. In this approach, the VAE serves as a filtering module to distinguish between frames relevant to soccer events and those containing irrelevant or background scenes. By passing each video frame through the VAE and calculating the reconstruction loss (the difference between the input and reconstructed image), the method flags frames with low loss as potential soccer events and filters out unrelated content. Only these candidate frames proceed to the next stage, where the CNNs classifiers assign them to one of nine event categories, such as corners, penalties, free kicks, tackles, substitutions, or card incidents. Event detection is finalized by evaluating 15-frame windows, assigning an event tag when the majority of frames indicate the same action.

Beyond event filtering and temporal scene analysis, modern deep learning architectures such as EfficientNet and You Only Look Once (YOLO) offer promising frameworks for direct play classification via image classification. EfficientNet is a family of convolutional neural networks that achieved state-of-the-art accuracy in image classification benchmarks in 2019 while requiring significantly fewer parameters and computational resources compared to prior models [41]. At that time, YOLO models primarily focused on object detection, but more recent versions, such as YOLOv11 [42], have expanded beyond their traditional role in object detection to include dedicated image classification capabilities. These models can be fine-tuned to categorize whole images according to play types or events, assuming access to suitably

&lt;page_number&gt;15&lt;/page_number&gt;

---


## Page 36

annotated training data. The Ultralytics² team has notably simplified YOLO model customization by providing user-friendly tools for transfer learning, data augmentation, and scalable training workflows [43]. This has made YOLO models highly accessible for rapid adaptation to specialized soccer analytics tasks, including event classification and precise player and ball detection.

These approaches above reflect the variety of analytical techniques, such as rule-based, feature-driven, and deep learning, that have been developed for football video analysis. Nonetheless, applying these methods directly to goal replays presents challenges, as replays often provide only partial sequences of play or are edited for broadcast, which can omit relevant tactical context. Despite these limitations, modern play or event classification techniques can still provide valuable insights when adapted to the unique structure of goal replays. The organized sequence of camera shots in replays, typically beginning with a wide-angle view to establish context, followed by close-ups and multiple supplementary angles, generally offers clear perspectives on both team buildup and individual actions. Appropriately leveraging these methods in the context of goal replays can support detailed analysis of scoring sequences and efficient organization of key moments for coaching, scouting, or fan engagement.

## 2.5 Goal Classification

Understanding how goals are scored, specifically, whether with the left foot, right foot, or head, is valuable for evaluating both team strategies and individual player abilities. Modern football video analysis enables this level of detail by detecting and tracking both the ball and the players, recognizing when a player makes contact with the ball, and determining which body part was used for the final touch (excluding the goalkeeper). These capabilities are made possible by recent advances in object detection and pose estimation, which together allow automated systems to extract and interpret detailed action information from broadcast footage.

### 2.5.1 Player and Ball Detection

Effective goal classification begins with accurate detection and tracking of both players and the ball. State-of-the-art object detection models such as YOLO rapidly identify and localize multiple objects across each frame by processing the entire image in a single pass. The latest version, YOLOv11 (2024), builds on the strengths of previous models, delivering higher detection accuracy, faster inference speeds, and improved computational efficiency [44], making it well-suited for real-time football analysis.

A practical example of such a system is presented by Jurca et al. (2022), who proposed a robust pipeline for extracting meaningful information from broadcast football video using Computer Vision (CV) and machine learning techniques [15]. Their framework is designed not only to detect and track players

---
²https://docs.ultralytics.com

&lt;page_number&gt;16&lt;/page_number&gt;

---


## Page 37

and the ball, but also to identify player roles and map image coordinates to real-world field positions. For per-frame object detection, they employed YOLOv5, a widely-used, versatile version of YOLO, which offered a balance between speed and reliable accuracy.

Jurca *et al.* also highlight the distinction between tracking methods needed for players versus the ball, due to their different visual and motion characteristics. Multiple Object Tracking (MOT) algorithms such as Simple Online and Realtime Tracking (SORT) are well-suited for players, who are numerous and generally large, making their bounding boxes reliable across consecutive frames. For the ball, however, SORT is less effective, as the ball’s small size and rapid, sometimes erratic movement make consistent detection challenging. Instead, region-based tracking methods like Channel and Spatial Reliability Tracker (CSRT), which rely on maintaining a Region of Interest (ROI) initialized by a detection, are preferred for tracking the ball. CSRT can follow the ball even when direct detections are momentarily lost, providing better continuity and accuracy than detection-dependent trackers in this context.

## 2.5.2 Pose Estimation

Pose-based methods play a crucial role in automating the classification of how goals are scored by linking detected movement patterns to specific body parts, such as the left foot, right foot, or head. There are two main paradigms in pose estimation approaches. Top-down methods begin by detecting individual players in the frame and then estimating their keypoints separately. Bottom-up methods, on the other hand, first detect all visible joints in the image and then group them into complete poses for each individual. Both strategies have been widely used in sports video analysis, each offering trade-offs between speed, accuracy, and robustness in complex scenes.

Among the deep learning-based pose estimation tools, YOLO-based approaches such as YOLOv11-Pose extend traditional object detection frameworks by jointly predicting both bounding boxes and human keypoints in a single forward pass of the network [45]. These models are designed for high-speed processing, making them particularly suited for sports applications where fast movements and multiple subjects must be tracked in real time. Another widely adopted solution is OpenPose [46], a bottom-up model that leverages part affinity fields and convolutional pose machines to detect keypoints for multiple people without the need for individual bounding box proposals. It is known for its robustness in crowded or occluded environments, also making it especially effective in football footage.

## 2.5.3 Posture Analysis

For soccer-specific, Yeung *et al.* [47] introduced the 3DSP dataset, which consists of sequences of cropped images from professional soccer broadcast videos focused on striking movements. Each sequence consists of 20 frames with both 2D joint coordinates in image space and 3D pose estimations

&lt;page_number&gt;17&lt;/page_number&gt;

---


## Page 38

reconstructed using temporal lifting models (techniques that infer 3D joint positions over time from 2D keypoint trajectories). This dataset enables the study of fine-grained biomechanics of striking actions in both spatial dimensions.

Building upon this dataset, the authors developed the AutoSoccerPose pipeline, which automatically extracts pose and motion features from video and uses graph-based recurrent models to embed pose sequences into compact vector representations. These representations are then clustered to identify different shot types, such as inside-foot or instep shots, based on biomechanical indicators like leg swing range and knee angle. Their work demonstrates the potential of pose data not only for classifying goal-scoring actions but also for adding an interpretable biomechanical layer to performance analysis in football.

### 2.5.4 Action Analysis

Building on the progress of pose-based methods for player motion understanding, recent research has demonstrated that it is possible to go beyond traditional player and ball tracking by achieving precise, automated attribution of both player actions and the specific body parts involved during decisive moments, such as a strike on the ball. Building on foundational event detection frameworks, such as those by Vidal-Codina et al. [38] (previously discussed in Section 2.4.1), George C. Bian leveraged detailed skeletal joint tracking data, like that introduced by Hawk-Eye Innovations, to overcome the traditional limitations of distinguishing similar events in complex match scenarios [48].

By incorporating rich spatio-temporal data captured through pose estimation, Bian’s approach not only identifies who last touched the ball, but also which body part (e.g., left foot, right foot, or head) executed the action. This is achieved using a decision tree algorithm that analyzes both the spatial proximity and precise timing between the tracked ball and specific player joints, as computed frame-by-frame from the skeletal data stream. When the ball’s trajectory suddenly changes, the model pinpoints the nearest relevant joint at the instant of contact, allowing for robust and fine-grained attribution of both player identity and body part.

Bian validated this method on the 2022 FIFA men’s world cup final, automatically detecting and classifying all 20 shots taken during regular time. The analysis distinguished not only the shooter and the outcome but also the specific body part used for each shot. These automated classifications closely matched those from manual broadcast annotations, showcasing the increased accuracy, reliability, and practical value enabled by this new level of skeletal data-driven analysis. Such fine-grained event classification is increasingly supported by modern computer vision and machine learning pipelines, bridging object tracking, player identification, and pose estimation into cohesive systems for comprehensive match analysis.

&lt;page_number&gt;18&lt;/page_number&gt;

---


## Page 39

# 2.6 Noteworthy Works

While the core components of this thesis focus on goal and play classification through object detection, tracking, pose estimation, and image classification, several additional methods and research directions are worth highlighting. Although not implemented in the current system, these techniques demonstrate significant potential for future integration. They span areas such as field segmentation, 3D spatial analysis, color-based team clustering, and multi-modal approaches that combine various data sources. Incorporating such techniques could potentially enhance the system’s overall performance, robustness, and tactical analysis capabilities.

## 2.6.1 Field Analysis

Field analysis involves several key tasks to enhance the understanding of sports environments. These tasks include detecting lines on the field, segmenting playing areas, and camera calibration, to transform 2D images into 3D world coordinates. While some tasks utilize AI-based approaches, others rely on traditional methods.

Line detection is a fundamental aspect of field analysis. Techniques such as detecting lines based on variations in grass color [49] and employing stochastic watershed transforms [50] are some of the approaches used. Accurate line detection is also essential for segmenting the field into distinct areas, including goal areas, penalty areas, and the center circle [51]. This segmentation facilitates a more detailed analysis of the playing area. Additionally, simple segmentation techniques focus on isolating the field from the rest of the image, offering a straightforward yet effective means of analysis [52].

Regarding line detection, advanced methods enable the transformation of 2D images into 3D world coordinates, which is essential for tasks like tactical analysis and understanding player positioning in real-world dimensions [53, 54]. Some of these methods also incorporate keypoint detection to improve localization and camera calibration processes [55]. While player tracking can often be achieved through object detection alone, integrating 3D transformations allows for more precise spatial analyses and deeper tactical insights.

## 2.6.2 Color-Based Clustering

K-means clustering, an unsupervised learning algorithm introduced in the 1950s, has also found applications in sports analytics [15]. The algorithm aims to partition $n$ observations into $k$ clusters, with each observation belonging to the cluster with the nearest mean.

In football analysis, k-means clustering can be applied to pixel segmentation for analyzing players’ jersey colors [15]. The algorithm iteratively assigns data points to the nearest cluster center and recalculates the center until convergence, providing a computationally efficient method for distinguishing

&lt;page_number&gt;19&lt;/page_number&gt;

---


## Page 40

between teams based on visual cues. For example, it can separate players into clusters based on whether they are wearing red or blue jerseys. This technique enables automated team assignment by grouping similar color patterns, facilitating the analysis of team-specific metrics such as ball possession percentage.

### 2.6.3 Integrated Approaches and Multi-modal Analysis

The most promising developments in sports analytics involve integrating multiple data sources and analysis techniques. For example, in tennis, systems can detect key points on the court and determine whether the ball is in or out of play [56]. In football, combining object detection, tracking, and camera movement analysis allows for a deeper understanding of game dynamics [15]. We can use this multi-model approach to analyze tactical formations, ball possession patterns, player movements, and speed metrics for both players and the ball.

Such integrated systems provide a holistic view of match performance, surpassing traditional observational methods. By offering deep insights into team strategies and individual performance, they empower coaches and analysts to make more informed decisions.

&lt;page_number&gt;20&lt;/page_number&gt;

---


## Page 41

# 3

# Architecture

## Contents

<table>
  <tr>
    <td>3.1 Input Specifications</td>
    <td style="text-align: right;">23</td>
  </tr>
  <tr>
    <td>3.2 Functional and Coverage Requirements</td>
    <td style="text-align: right;">23</td>
  </tr>
  <tr>
    <td>3.3 System Architecture</td>
    <td style="text-align: right;">24</td>
  </tr>
</table>

&lt;page_number&gt;21&lt;/page_number&gt;

---


## Page 42

22

---


## Page 43

This chapter provides an overview of the system architecture and the key requirements that the proposed solution addresses. Building on the foundational components discussed in Chapter 2, we begin by detailing the video input characteristics and constraints in the Section 3.1. We then outline the essential operational and coverage needs in the Section 3.2, which define the scenarios the system must reliably handle. Finally, the chapter presents a high-level description of the system’s structural organization and data flow in the Section 3.3. This framework clarifies how the individual modules integrate and collaborate to achieve robust play and goal classification within soccer goal replay video analysis.

## 3.1 Input Specifications

The system is designed to process broadcast video clips with frame rates typically ranging from 20 to 60 frames per second, thereby accommodating common variations in broadcast footage. It also accepts variable input resolutions, but while higher-quality video generally improves detection accuracy, due to the constraints of the employed models and broadcast quality limitations, resolutions above $1280 \times 720$ pixels do not substantially enhance performance.

## 3.2 Functional and Coverage Requirements

Beyond the characteristics of video input, the system must reliably detect shot transitions, including abrupt cuts and gradual dissolves, to ensure accurate goal and play classification. Achieving proper shot separation prevents errors in play classification and enables multi-perspective analysis, enhancing interpretation and confidence in goal classification.

For effective play classification, the system is further required to select representative frames that capture the essence of each play. Although goal replays typically begin with a wide-angle view of the action, it is important for the system to accommodate scenarios where the replay starts with a preceding event, such as a foul that leads to a penalty or free kick.

In addition, robust detection of ball and player touches remains essential for goal classification accuracy. The system must be capable of maintaining consistent event recognition even when the ball or players are momentarily occluded within the video frames. Furthermore, it should be able to ignore goalkeeper touches, particularly those made with the hands, from touches by other players, ensuring a clear differentiation of relevant touches.

With further refinement, techniques such as k-means clustering based on jersey color could be implemented to differentiate between goalkeepers, attackers, defenders and referees, and to reliably identify the last attacking player’s contact with the ball.

&lt;page_number&gt;23&lt;/page_number&gt;

---


## Page 44

# 3.3 System Architecture

<mermaid>
graph TD
    A[Goal Replay Video] --> B[Shot Detector and Classifier]
    A --> C[Play Classifier]
    A --> D[Goal Classifier]

    B --> B1[Shot Boundary Detector]
    B1 --> B2[/Shot Intervals/]
    B2 --> B3[Shot Classifier and Filter]
    B3 --> B4[/Long and Medium Shots Intervals/]

    C --> C1[Play Classification]
    C1 --> C2[/Play Type/]
    C2 --> C3{Is Long Play?}
    C3 -- Yes --> C4{First Shot Interval}
    C3 -- No --> C5[Play Classification and Confidence]
    C4 -- Yes --> C5
    C4 -- No --> C6[Play Classification and Confidence]

    D --> D1[Player and Ball Detector]
    D1 --> D2[/Player and Ball Bounding Boxes/]
    D2 --> D3[Touch Detector]
    D3 --> D4[/Touch Occurrence Frames/]
    D4 --> D5[Touch Analyzer]
    D5 --> D6[Goal Classification and Confidence]
</mermaid>

**Figure 3.1:** The architecture of the proposed solution showing its main components: shot detector and classifier, play classifier, and goal classifier, along with their interactions.

The presented architecture for goal replay analysis in soccer broadcasts, see Figure 3.1, follows a three-stage process: shot detection and classification, play classification, and goal classification.

*   **Shot detection and classification:** The system first detects shot intervals within the broadcast video, segmenting it by different camera shots. Using a trained image classification model (trained on around 740 images before augmentation), each shot is classified into three categories: long, medium, or other. Only long and medium shots are retained for further analysis since only they capture the field view relevant for goal events. This filtering step ensures irrelevant close-up, audience shots, or unrelated shots are excluded.
*   **Play classification:** The play classification component takes the initial frame of the first long or medium shot to classify the type of play leading to the goal. A separate image classification model (trained on roughly 500 images before augmentation) classifies the play into one of four categories: long play, corner, free kick, or penalty. If the first shot does not show the perspective of the actual goal event but rather a preceding event, such as a foul, our solution looks at the second shot and

&lt;page_number&gt;24&lt;/page_number&gt;

---


## Page 45

uses its classification to decide the correct play type. This step helps correctly identify the origin context of the goal in replays where the first shot might be misleading.

*   **Goal classification:** For every relevant shot (the retained medium and long shots), a specialized detector, adapted according to the shot type, identifies the positions of the ball and players. Since the model is fine-tuned to detect smaller balls in distant (long) shots or closer balls in medium shots, it ensures high accuracy of ball detection even when the ball appears very small. Employing those detection, the system maintains smooth tracking of the ball’s path across frames by removing false positives and predicting ball locations during brief detection losses.

Using the relative movement between the ball and players’ bounding boxes, the system detects “touches”, moments when a player interacts with the ball, by analyzing factors such as speed and angle of ball movement relative to each player. For each detected touch, starting with the last detected touch before the goal (usually the scoring action), the classifier extracts three frames: before, during, and after the touch, cropped around the ball. These frames are analyzed using keypoints detected by the YOLO pose estimation model to identify the keypoint most likely responsible for the touch. Based on these keypoints, the system classifies the body part used to score the goal, focusing on main parts like the right foot, left foot, or head. Confidence scores are calculated from all shots and combined using custom logic to produce a more precise goal classification.

This approach balances temporal and spatial analysis, starting by narrowing down relevant shots, then contextualizing the play type, and finally performing detailed spatial-temporal analysis of player and ball interaction to classify the goal action accurately. The use of multiple specialized, trained models at each stage, along with filtering and confidence-based decisions, enhances robustness and precision of the overall goal event classification.

&lt;page_number&gt;25&lt;/page_number&gt;

---


## Page 46

&lt;page_number&gt;26&lt;/page_number&gt;

---


## Page 47

# 4

# Implementation

## Contents

<table>
  <tr>
    <td>4.1 Shot Detection</td>
    <td>29</td>
  </tr>
  <tr>
    <td>4.2 Shot Classification</td>
    <td>31</td>
  </tr>
  <tr>
    <td>4.3 Play Classification</td>
    <td>32</td>
  </tr>
  <tr>
    <td>4.4 Goal Classification</td>
    <td>33</td>
  </tr>
</table>

&lt;page_number&gt;27&lt;/page_number&gt;

---


## Page 48

&lt;page_number&gt;28&lt;/page_number&gt;

---


## Page 49

This chapter details the practical implementation of the proposed system for goal and play classification in soccer goal replay analysis. We describe the step-by-step development of each component, highlighting the encountered challenges, the algorithmic choices, and the rationale behind the key design decisions. Although the main components are organized by execution order, shot detection (Section 4.1), shot classification (Section 4.2), play classification (Section 4.3), and goal classification (Section 4.4), the development process did not follow this sequence. In practice, work began with goal classification, as this area provided an accessible testbed for experimenting with different models and techniques. Insights gained while working on goal classification reshaped our early ideas for play classification, particularly when it became clear that field detection was not a practical solution due to its considerable execution time. Without reliable field detection, we were unable to use object detection to determine whether the ball was stationary, a key step in the initial ideas to classify the type of play. Shot classification was addressed after shot detection, in part to allow for the potential reuse of detection features such as green color ratios, although these features were ultimately not incorporated into the final classification approach.

## 4.1 Shot Detection

This section describes the iterative process undertaken to develop an effective shot detection module, from early heuristic approaches to the adoption of deep learning-based solutions.

### 4.1.1 Solution

For our Shot Boundary Detection (SBD) approach, we adopted TransNetV2, a state-of-the-art deep learning model for shot boundary detection, which outperformed traditional and contemporary methods as of 2020 [29]. TransNetV2 employs dilated convolutions, allowing it to efficiently capture both spatial and temporal context, making it particularly effective at detecting both abrupt cuts and gradual dissolves within broadcast video.

In practice, to reduce artifacts near detected shot boundaries (such as a lingering frame from the previous shot), we applied a small frame offset to both the start and end points of each detected shot interval. This refinement reduces the chance of object detection errors originating from the detection of players and the ball in the previous shot, which can affect subsequent modules, ensuring higher-quality segmentation for play and goal classification.

&lt;page_number&gt;29&lt;/page_number&gt;

---


## Page 50

# 4.1.2 Other Approaches

For simplicity, we could use similarity metrics, particularly image quality assessment algorithms such as Mean Structural Similarity Index (MSSIM) and Peak Signal-to-Noise Ratio (PSNR) [57]. These methods effectively capture abrupt changes in content, providing decent results for detecting hard cuts. However, they struggle with gradual transitions, such as dissolves, where the change between frames occurs smoothly over several seconds.

To address this limitation, we could incorporate variance analysis to identify periods of slow transition. While this approach could enhance the detection of gradual transitions, it also introduces false positives. For example, scenes with rapidly changing elements, such as blurred images during fast motion or advertising boards occupying much of the background in medium shots and switching to a different advertisement, could sometimes be misclassified as transitions.

To filter out such false positives, a possibility was to train an image classification model, such as YOLOv11, to distinguish between frames containing fast motion and those representing actual shot transitions, as we did to further try to improve our shot detection accuracy. For that purpose, we created a training set of approximately 80,000 images, drawing from the SUN397¹ dataset [58], as well as additional sports and soccer scenes. Synthetic transformations, including randomized motion blur (varying intensity and angle) and artificial dissolve effects (variable transparency blends between two random images), were applied to train the model to differentiate between the two cases. However, despite these efforts, the resulting model did not generalize well to soccer broadcast data and often failed to accurately distinguish true shot transitions.

There are also other approaches, such as those presented by Bayat et al. [14], leveraging differences in green color ratios and intensity tailored for sports broadcasts. In their work, the field is first segmented to isolate green areas corresponding to the grass. Within this grassy region, connected components analysis is used to detect “holes”, areas not covered by grass, typically corresponding to players. The rationale presented in their work was that a higher hole ratio (i.e., more or larger holes in the grass region) would correlate with long shots:

$$\text{HoleRatio}(i) = \frac{\sum_{b=1}^{c} \text{Area}(\text{Hole}^i(b))}{M \times N}, \tag{4.1}$$

where $M$ and $N$ are the width and height of the frame, $c$ is the number of detected holes (blobs/players) in frame $i$, and $\text{Area}(\text{Hole}^i(b))$ is the area of the $b$-th hole. However, upon reviewing their description, it was unclear how increased hole size would reliably distinguish long shots from medium or close shots, especially since closer players can also create large interruptions in the grass region.

---
¹https://groups.csail.mit.edu/vision/SUN/hierarchy.html

&lt;page_number&gt;30&lt;/page_number&gt;

---


## Page 51

# 4.2 Shot Classification

The shot classification module is responsible for categorizing camera shots in each detected shot interval. To develop and train this component, we constructed a dedicated image dataset consisting exclusively of goal replay frames, provided by Six Floor Solutions. These images were manually selected and extracted from 60 distinct match broadcasts, ensuring relevance and diversity across typical soccer production styles.

In the initial phase, approximately 260 images (prior to augmentation) were gathered from a selection of the 60 games. Following the scheme proposed by Bayat et al. [14], shots were labeled into four categories: *long*, *medium*, *close*, and *audience*, as shown in Figure 4.1. Afterwards, the dataset was divided into three parts, with 70% allocated for training, 15% for validation, and 15% for testing. Additionally, about 200 extra images from the same set of games were reserved for qualitative analysis and model sanity checks.

&lt;img&gt;Figure 4.1: Classification of camera shots into long, medium, close, and audience categories based on the distance to the play or content of the shot, following the detection of transition boundaries.&lt;/img&gt;

After preliminary training, the model achieved promising results but exhibited occasional confusion between the *close* and *audience* categories. Given that the distinction between these two was not important to our analysis, we merged them into a single class labeled *other*. This simplification reduced ambiguity and enhanced both model performance and interpretability.

To increase the dataset diversity, we proceeded to extract more images from the original 60 games, increasing the pre-augmentation total to approximately 740 images. We then applied various augmentation techniques, including adjustments to saturation, brightness, gamma, and hue, as well as horizontal flips and minor rotations, expanding the dataset to roughly 2,800 images. Images were then grouped into three final classes: *long*, *medium*, and *other*.

Finally, to maximize the model’s reliability given the limited dataset size, we subsequently adopted a k-fold cross-validation training strategy using the augmented dataset. The resulting model demonstrated robust performance, with most residual errors occurring between visually ambiguous cases. However, these minor inaccuracies were found to have a negligible impact on the broader play and goal classification tasks.

&lt;page_number&gt;31&lt;/page_number&gt;

---


## Page 52

# 4.3 Play Classification

The play classification component was developed through a progression of methods. We began by exploring motion and spatial feature analysis, attempting to identify plays based on the ball's stationary state and player positioning. After encountering challenges with consistent feature extraction, we experimented with field detection for stationary ball identification. Ultimately, our pipeline shifted to image-based classification, starting with EfficientNetB0 and later adopting the newer YOLOv11 architecture, utilizing data augmentation and cross-validation to improve classification accuracy.

## 4.3.1 Solution

For our play classification component, we adopted a more recent architecture, YOLOv11, to classify an image as *long play*, *corner*, *free kick*, or *penalty*. The training dataset comprised 495 images prior to augmentation, with 40% sourced from a Kaggle dataset², that underwent a manual filtering process to select good quality images from relevant plays suitable for play classification, while the remaining 60% of the dataset consisted of goal replay frames extracted from the 60 matches referenced in Section 4.2.

After applying the same augmentations used previously in the shot classification (Section 4.2), the dataset was expanded to approximately 2,000 images. Using those images, we employed cross-validation during training to maximize model reliability, and this final approach delivered a good performance in classifying play types that led up to goals.

With this model, we analyze an initial frame of the first *long* or *medium* shot to classify the type of play that led to the goal. If the first shot is identified as a *long play*, it may not depict the actual scoring event but rather a preceding action, such as a foul that results in a penalty. In such cases, the system continues by examining the following shot. If this shot is determined to be a penalty, the play type for the goal is assigned according to this second classification, as it more accurately represents the goal’s origin.

## 4.3.2 Other Approaches

Another approach involved distinguishing long plays from set-piece situations by determining whether the ball was stationary at the start of the sequence. To further differentiate among set-piece types, the distribution of players and their distances from the ball could be analyzed. However, due to varying camera angles and continuous movement, it is difficult to establish a reliable fixed reference point for measuring the ball’s motion and determining its stationary state.

Given this challenge, field detection techniques [2] could be used to leverage pitch keypoints as references for stationary ball detection. This method performs reasonably well for *long* shots, where

---
²https://www.kaggle.com/datasets/rishintiw/soccer-event-classification-image-data-cnn-and-llm

&lt;page_number&gt;32&lt;/page_number&gt;

---


## Page 53

more of the field and its lines are visible, but its effectiveness drops significantly for other shot types. Moreover, field detection substantially increases the system’s execution time, making it impractical for applications requiring near real-time results.

Alternatively, similar to our approach, we could use an image-based classification model based on EfficientNetB0, following the methodology of Ali Karimi et al. [40] and their most successful parameter settings. Unfortunately, this model did not yield satisfactory results for our play classification task, especially when compared to YOLO.

## 4.4 Goal Classification

The goal classification component focuses on identifying how the goal was scored, primarily distinguishing whether it was scored with the left foot, right foot, or by a header. Our initial approach sought to analyze ball movement on the field to detect player touches and determine the last contact with the ball. By integrating pose estimation, we aimed to identify the closest player keypoints moving toward the ball at the moment of contact to infer how that player scored the goal.

However, because field detection was impractical for our analysis, due to its high execution time and limited applicability to less than half of the shots (only on some long shots), we shifted our strategy. Instead, we focused on analyzing the relative movement of the ball to each player, circumventing the challenge of selecting a stationary reference point within each camera shot.

Initially, we also attempted to rely solely on the proximity of certain player keypoints and their motion toward the ball for classification. Yet, the varying camera perspectives made this approach difficult to generalize, leading us to develop a more sophisticated logic that more reliably integrates spatial and temporal cues for goal classification.

The final architecture of the solution, along with some explanations, is illustrated in Figure 4.2.

## 4.4.1 Object Detection

The goal classification first step is to detect players and the ball, as shown in Figure 4.3, since the rest of the analysis depends on these detections. We initially employed YOLOv11 for object detection. While YOLOv11 performed well in medium shots, where players and the ball appear larger and closer to the camera, it struggled in long shots. In these wide-angle views, the ball and players are much smaller, making them harder to detect, particularly the ball.

To address these challenges, we experimented with an Ultralytics tool called Slicing Aided Hyper Inference (SAHI) [59]. SAHI works by dividing each image into smaller slices, applying object detection to each slice, and then merging the results, normally improving detection performance for small objects. Although SAHI helped in identifying some missed balls in long shots, it also generated numerous false

&lt;page_number&gt;33&lt;/page_number&gt;

---


## Page 54

mermaid
graph TD
    subgraph Goal Classifier
        A[Goal Replay Video] --> B[Goal Classifier]
        B --> C[Player and Ball Detector]
        C --> D[Player and Ball Bounding Boxes]
        D --> E[Touch Detector]
        E --> F[Touch Occurrence Frames]
        F --> G[Touch Analyzer]
        G --> H[Goal Classification and Confidence]
        H --> A
    end

    subgraph Details
        B -- "For each camera shot:" --> C
        C -- "A specialized model is used to detect the ball in long shots, while the YOLOv11 object detection model detects the ball in medium shots and identifies players in both medium and long shots. Afterward, the Bot-SORT tracking algorithm is employed to track each player, and a custom ball-tracking logic is applied." --> B
        E -- "Touches are detected by analyzing the movement of the ball in relation to each player's bounding box in the frame, focusing on variations in speed and angle." --> E
        G -- "Touches are analyzed in reverse order, as the last touch typically determines the scoring action. From that touch, the frame corresponding to the touch, along with the frames from the pre-touch and post-touch moments, is extracted and cropped around the ball. Next, a pose estimation model is applied to analyze the player's movement using keypoints. This analysis identifies the body part responsible for scoring the goal by employing a decision tree based on the extracted player pose, movement features, and ball movement." --> G
        H -- "The keypoints detected from each camera shot are then analyzed using a decision tree to determine if the results from each shot are similar, which likely indicates accurate detection, otherwise, the results are considered inconclusive." --> H
    end
```

Figure 4.2: Detailed logic of the goal classifier component.

&lt;img&gt;A soccer field scene showing multiple players and a soccer ball. Bounding boxes with class labels (e.g., person, sports ball) and confidence scores (e.g., 0.94, 0.93, 0.92) are overlaid on the players and ball.&lt;/img&gt;
&lt;watermark&gt;ultralytics&lt;/watermark&gt;

Figure 44.3: YOOLOv11 Object Detection: Bounding boxes with class labels and confidence scores positioned above [1].

&lt;page_number&gt;34&lt;/page_number&gt;

---


## Page 55

positives (such as trash on the field, gloves, or football boots), ultimately creating additional wrong detections and further making the detection of real ball harder. For these reasons, we ultimately decided not to use SAHI, as it was not worth the trade-off.

Fine-tuning an object detection model for small soccer balls, whose appearance varies substantially in colors, size, and shape (sometimes appearing elliptical due to motion), was not achievable given the limitations of the thesis timeline. Instead, we sought existing pre-trained models, among the methods investigated, Widely Applicable Strong Baseline for Sports Ball Detection and Tracking (WASB-SBDT) [60] appeared promising, as its models were trained for multiple sports, including soccer. However, since official inference code was not available, we used an independent implementation by Chaitanya Jadhav³ that followed the original work. Despite good results in other sports (e.g., tennis), this method proved ineffective for soccer ball detection and tracking.

Another promising resource was an open-source repository providing a model fine-tuned specifically for soccer⁴. This model was often able to detect the ball under far camera views and could sometimes distinguish between players, goalkeepers, and referees. However, its person classification (player, goalkeeper, referee) was not reliable, so we used the model exclusively for ball detection in long shots. For medium shots, as well as for player detection in both long and medium shots, we continued to rely on YOLOv11.

### 4.4.2 Object Tracking

For object detection, we ultimately used the Ultralytics YOLO tool, which includes implemented trackers such as BoT-SORT and ByteTrack [61]. However, these trackers did not perform well for tracking the ball, often ignoring isolated correct detections. While we employed BoT-SORT successfully for player tracking, we developed a custom algorithm specifically to track the ball by constructing a ball trajectory, a sequence of linked bounding boxes representing ball detections within each camera shot.

The algorithm started by detecting candidate ball bounding boxes in a camera shot, connecting detections of the same object based on proximity, similar size, and color. Treating these smaller ball trajectories as graph nodes, we constructed a directed graph where edges represent plausible temporal connections between these nodes. An edge from one node to another was allowed only if the first node’s detections occurred before those of the second, respecting temporal order.

Each edge was assigned a weight designed to encourage paths with characteristics reflecting true ball movement. The weighting favored nodes with many detections (reducing the impact of isolated false positives), temporally close nodes (assuming the ball is the most consistently detected object amid false positives), and nodes located within player bounding boxes that showed the ball leaving contact (to

---
³https://github.com/indiciium15/wasb-sbdt-inference
⁴https://github.com/Mostafa-Nafie/Football-Object-Detection

&lt;page_number&gt;35&lt;/page_number&gt;

---


## Page 56

exclude detections corresponding to gloves or boots). It also encouraged connections between nodes with similar bounding box sizes and physically close detections where the end of one path was near the start of the next.

The algorithm then selected the most probable path through this graph that maximized the number of correct ball detections. Missing detections between linked bounding boxes were interpolated using simple linear interpolation. While not perfectly accurate, this method was chosen due to time constraints and overall proved sufficient without significantly degrading final tracking results.

## 4.4.3 Touch Detection

To detect touches on the ball, such as passes or player strikes leading to a goal, our initial approach focused on analyzing the ball’s movement across the field to identify when and where player contacts occurred. The objective was to pinpoint the frame corresponding to the last touch before a scoring event and its location within that frame. Subsequently, we aimed to incorporate pose estimation techniques to identify the player keypoints closest to the ball at moments of contact and to track their movement trajectories toward the ball, enabling the determination of which body part was involved in scoring.

However, this approach relied on accurate field detection to provide a stable spatial reference. Due to the impracticality of field detection in our context, primarily because of its high computational cost and its successful operation on fewer than half of the analyzed shots (mostly limited to some long shots, shown in Figure 4.4), we revised our methodology.

&lt;img&gt;Figure 4.4: Field detection with lines connecting keypoints that correspond to the soccer field lines and goal frame [2].&lt;/img&gt;

Instead of depending on a fixed reference point in the frame, we analyzed the ball’s motion relative to each player’s movement directly. By computing relative movement vectors between the ball and the players, we avoided the need to identify a stationary point within each camera shot, thereby developing a more flexible and widely applicable method for detecting ball touches.

This revised approach begins by computing the movement vector for each player and for the ball by comparing their positions in the current frame to their positions in the previous frame. Subtracting a player’s movement vector from the ball’s movement vector yields the motion of the ball relative to that player, as illustrated in Figure 4.5.

&lt;page_number&gt;36&lt;/page_number&gt;

---


## Page 57

&lt;img&gt;A soccer player in a white jersey running on a green field with a purple bounding box around him. A blue vector points to his right foot, indicating player movement. A green bounding box surrounds a ball near his foot.&lt;/img&gt;

(a) Player and ball bounding boxes are shown. The blue vector indicates player movement and the green vector indicates ball movement, both measured within the frame.

&lt;img&gt;A diagram showing three vectors. A green vector (ball movement) and a blue vector (inverted player movement) combine to form a red vector (ball's movement relative to the player).&lt;/img&gt;

(b) Calculation of the ball’s movement relative to the player. The green vector shows ball movement, the blue vector is the inverted player movement, and their sum forms the red vector representing the ball’s movement relative to the player.

**Figure 4.5:** Illustration of touch detection analysis.

Afterwards, we analyze these relative vectors to determine whether the ball is sufficiently close to a player’s bounding box. When such proximity is detected, a sudden change in the magnitude or direction of the relative vector serves as an indicator that the player has likely made contact with the ball, shown in Figure 4.6.

&lt;img&gt;Three sequential frames of a soccer match. In each frame, a player in a red jersey (number 7) is highlighted by a blue bounding box. A yellow bounding box marks the ball. A green arrow indicates the ball’s movement relative to the player’s position in the frame.&lt;/img&gt;

*   Blue: Player bounding box
*   Cyan: Ball bounding box
*   Green: Ball movement relative to the player position in frame

**Figure 4.6:** Object detection and tracking in a touch occurrence.

&lt;page_number&gt;37&lt;/page_number&gt;

---


## Page 58

# 4.4.4 Touch Analysis

Once a ball touch is detected, the algorithm processes all detected touches in reverse chronological order, prioritizing the most recent one as it typically corresponds to the decisive scoring action. From this touch, the algorithm extracts the associated video frame along with a sequence of frames immediately preceding and following the moment of contact.

Subsequently, these extracted frames are cropped to tightly focus on the region surrounding the ball, thereby ensuring that the analysis concentrates precisely on the interaction between the player and the ball. Following this preparation, a pose estimation model is applied to the cropped frames to analyze the player’s movements by detecting and tracking keypoints. This detailed analysis enables the algorithm to assess the player’s body posture and determine which body part was involved in the touch event.

In choosing a pose estimation model, various options were evaluated, including OpenPose [46], YOLO-NAS Pose [62], and YOLOv11 Pose [63]. OpenPose was found to yield suboptimal results on the cropped images, largely due to motion blur and varying camera distances. Meanwhile, although YOLO-NAS Pose demonstrated a slightly superior mean Average Precision (mAP$^{pose}_{50-95}$), it performed slightly worse than YOLOv11 in our practical tests and was somewhat slower. Ultimately, the latest YOLOv11 pose estimation model was selected, exemplified in Figure 4.7.

&lt;img&gt;Figure 4.7: Visualization of pose estimation using Ultralytics YOLOv11 [3], with each detection labeled by its class and confidence score.&lt;/img&gt;

Using the YOLOv11 model, keypoints located near the ball at the moment of contact were identified. Initially, our approach involved selecting the closest player keypoints that were moving toward the ball at the time of the touch. However, this straightforward method frequently produced errors, especially when the ball’s movement appeared more pronounced toward the supporting foot, varying with camera perspective.

To overcome these issues, a more sophisticated logic was developed. This approach integrates cues from player posture, movement features, and ball motion to determine the most probable keypoint

&lt;page_number&gt;38&lt;/page_number&gt;

---


## Page 59

responsible for the touch, accompanied by a confidence score reflecting its likelihood of correctness.

If the detected body part is a hand, the touch is disregarded and the algorithm considers the previous touch instead, since hand contacts typically correspond to goalkeeper interactions. If the touch does not involve a hand, the decision process proceeds as follows:

*   When the shot does not offer a clear view with only one player keypoint close to the ball, that shot is not used to classify the touch. A conclusive classification requires the presence of either a single keypoint near the ball or two keypoints if both correspond to the feet of one player. Notably, all head keypoints of each player are aggregated into a single group referred to as the “head”.
*   In cases where only one foot is detected near the ball, the algorithm checks for the presence of the other foot. If the second foot is not visible, the detected foot keypoint is still returned but assigned a lower confidence score to account for possible occlusion. For keypoints that are neither feet nor hands, a high confidence score is granted, given their unique proximity to the ball at the touch moment.
*   If the camera is positioned in front of or behind the player, the ball’s trajectory direction is examined. A typical indicator of a foot touch is when the ball approaches from one direction and rebounds toward the same side, suggesting contact with the foot opposite the ball’s incoming direction. Although there are exceptions such as the “trivela” kick, this heuristic generally aids in identifying the foot that made contact.

Should this directional heuristic prove inconclusive, the player’s posture is analyzed for additional cues. For example, a higher foot combined with an extended or farther opposite arm often correlates with the balance and power generation posture typical during a kick. This provides further evidence to pinpoint which foot made contact.

*   When the camera is positioned to the player’s side, the algorithm detects if one foot is higher and bent backward with the ball located in front of the player, a posture characteristic of a kick.

This decision-making logic for selecting the most probable contact keypoint is summarized in the decision tree presented in Figure 4.8 and is applied independently for each camera shot.

Ultimately, after processing and classifying all relevant camera shots, the system aggregates the detected keypoints together with their associated confidence scores from shots classified as *long* or *medium* for further analysis and final prediction of the goal classification.

### 4.4.5 Final Prediction

Lastly, the overall goal classification result is obtained by aggregating the predictions from all relevant camera shots. A conclusive outcome is assigned only if there is strong consensus across these views,

&lt;page_number&gt;39&lt;/page_number&gt;

---


## Page 60

mermaid
flowchart TD
    A(["Keypoints detection around ball"]) --> B["Number of keypoints close to ball"]
    B -- "1" --> C["Type of keypoint"]
    C -->|Foot| D["Number of player feet detected"]
    D -- "1" --> E["That keypoint with 40% confidence"]
    D -- "2" --> F["That keypoint with 70% confidence"]
    C -->|Other| G["Check previous camera shot"]
    B -- "2+" --> H["Ignore Camera Shot Result"]
    B -- "2" --> I["Both feet"]
    I -->|Yes| J["Camera position"]
    I -->|No| K["Ignore Camera Shot Result"]
    J -->|Back or front of the player| L["The ball came from one direction and then returned"]
    J -->|Side of the player| M["The ball in front of the player"]
    L -->|No| N["Theres a foot raised and player bent correctly"]
    L -->|Yes| O["The foot opposite the ball's origin with 60% confidence"]
    M -->|Yes| P["Theres a foot higher and is bent back"]
    P -->|Yes| Q["That foot with 40% confidence"]
```

Figure 4.8: Keypoint decision tree according to pose and ball movement on a touch occurrence.

&lt;page_number&gt;40&lt;/page_number&gt;

---


## Page 61

for example, when the same keypoint is consistently identified as the scoring body part in the majority of shots, and alternate keypoints receive consistently low confidence scores. If these criteria are not met, the goal classification is considered inconclusive. This aggregation strategy enhances robustness and minimizes the risk of a wrong classification resulting from ambiguous or inconsistent frames. The logic underlying this decision process is illustrated in the decision tree shown in Figure 4.9.

<mermaid>
graph TD
    A[Keypoints results across camera shots] --> B[Total keypoints]
    B -- "∧" --> C[Return its confidence multiplied by 0.6]
    B -- "≥x" --> D[Keypoint has majority]
    D -- "Yes" --> E[Other keypoints confidence < 50%]
    E -- "Yes" --> F[Returns a confidence value that reflects the weighted contributions of the majority keypoint and other detected keypoints.]
    E -- "No" --> G[Returns Inconclusive]
    D -- "No" --> H[Returns Inconclusive]
</mermaid>

**Figure 4.9:** Decision tree to determine whether a keypoint is probable as the body part responsible for scoring the goal or inconclusive. If deemed probable, it calculates the confidence based on the results from all long and medium camera shots.

&lt;page_number&gt;41&lt;/page_number&gt;

---


## Page 62

42

---


## Page 63

&lt;page_number&gt;43&lt;/page_number&gt;

# 5

# Evaluation

## Contents

<table>
  <tr>
    <td>5.1 Test Dataset</td>
    <td>45</td>
  </tr>
  <tr>
    <td>5.2 Metrics</td>
    <td>46</td>
  </tr>
  <tr>
    <td>5.3 Experimental Setup</td>
    <td>47</td>
  </tr>
  <tr>
    <td>5.4 Results</td>
    <td>47</td>
  </tr>
</table>

---


## Page 64

44

---


## Page 65

This chapter details the evaluation of the proposed system, providing a comprehensive analysis of its performance in real-world scenarios. To establish context, we begin by describing the test dataset and its sources (Section 5.1). Next, we explain the evaluation metrics (Section 5.2) and experimental setup (Section 5.3), which underpin our analysis. Building on this foundation, results for each system components, such as shot classification, play classification, and goal classification, are then presented (Section 5.4). These results offer quantitative and qualitative insights into the system’s effectiveness and areas for potential improvement.

## 5.1 Test Dataset

The test dataset was compiled to ensure broad coverage of diverse football scenarios and broadcasting conditions. It consists of approximately 80 goals extracted from 24 matches played between February 20 and April 20, 2025, shown in Table 5.1. These matches span top European and international competitions, including the UEFA Champions League, UEFA Europa League, Saudi Pro League, and Taça de Portugal, with samples drawn from both men’s and women’s games. Video material was sourced from major sports broadcasters and streaming channels, including BenficaTV, SportTV1, and DAZN, to ensure variability in commentary styles, production standards, and video quality. This heterogeneity enables a robust evaluation of the system across different camera angles, lighting conditions, and replay formats characteristic of different professional football broadcasts.

**Table 5.1:** Games and total goals by league in the test dataset.

<table>
<thead>
<tr>
<th>League</th>
<th>Games</th>
<th>Total Goals</th>
</tr>
</thead>
<tbody>
<tr>
<td>UEFA Champions League</td>
<td>9</td>
<td>33</td>
</tr>
<tr>
<td>UEFA Europa League</td>
<td>9</td>
<td>33</td>
</tr>
<tr>
<td>Saudi Pro League</td>
<td>3</td>
<td>9</td>
</tr>
<tr>
<td>Taça de Portugal</td>
<td>3</td>
<td>11</td>
</tr>
</tbody>
</table>

While the play classification analysis proved relatively fast and produced promising results, the time-consuming nature of shot and goal classification, combined with the repeated errors that occurred on those components, led us to adjust our approach. Instead of analyzing goals in strict chronological order (by game ID) from the oldest to the most recent matches, we aimed to increase the diversity of scenarios under study. To achieve this, we expanded the dataset by adding 24 additional goals to the initial 21 that had already been analyzed, resulting in a total of 45 goals drawn from 12 different games. This broader sample offered greater variation in both play types and scoring methods. The distribution of the selected games by league is presented in Table 5.2.

&lt;page_number&gt;45&lt;/page_number&gt;

---


## Page 66

Table 5.2: Games and total goals by league used in the shot classification and goal classification analysis.

<table>
<thead>
<tr>
<th>League</th>
<th>Games</th>
<th>Total Goals</th>
</tr>
</thead>
<tbody>
<tr>
<td>UEFA Champions League</td>
<td>3</td>
<td>10</td>
</tr>
<tr>
<td>UEFA Europa League</td>
<td>6</td>
<td>25</td>
</tr>
<tr>
<td>Saudi Pro League</td>
<td>1</td>
<td>4</td>
</tr>
<tr>
<td>Taça de Portugal</td>
<td>2</td>
<td>6</td>
</tr>
</tbody>
</table>

From this smaller dataset of 45 goals (out of the 86 available), we observed 5 out of 9 headers, 31 out of 57 right-footed goals, and 9 out of 20 left-footed goals. Since the play classification analysis on its own was relatively fast, we then extended the analysis of this step to the entire dataset, ultimately analyzing the classification across all 86 goals.

## 5.2 Metrics

To the best of the author’s knowledge, there is an absence of available methods to classify goals or types of plays from soccer goals replays, so a manual analysis will serve as the benchmark for comparison.

Using the results of the classifications, we will fill the confusion matrices and quantify True Positives (TPs) and False Positives (FPs). TPs represent correctly predicted instances, and FPs are incorrectly predicted instances. In addition to these basic metrics (TPs, FPs), our evaluation will include the following performance measure:

$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}. \quad (5.1)$$

The first component under evaluation is the goal classification task. Initially, the plan was to use the outcomes of all classification tasks to compute precision (eq. (5.1)) and populate the corresponding confusion matrices. However, since goal classification did not yield satisfactory results, our focus here will be on analyzing the sources of these shortcomings and discussing possible improvements. In this context, we will also address the results of shot detection and classification, as well as the performance of object detection and pose estimation models.

Subsequently, we evaluate the classification of the type of play leading to the goal (i.e., *long play*, *free kick*, *corner kick*, *penalty*). For this task, precision (eq. (5.1)) and confusion matrices are again employed to assess performance.

Finally, we will assess the feasibility of running the system in real-time by analyzing runtime data alongside replay duration. Specifically, the total processing time for each replay will be measured and divided by the duration of the replay to calculate the average processing time per second.

&lt;page_number&gt;46&lt;/page_number&gt;

---


## Page 67

# 5.3 Experimental Setup

We conducted the analysis on a machine made available by Six Floor Solutions, featuring an Intel® Xeon® Gold 6132 CPU (2.60 GHz, 14 cores), an NVIDIA Tesla P40 GPU (24 GB), and 377 GB of RAM.

Our initial plan was to compare the performance with and without GPU acceleration. However, due to the unreasonable amount of time required to process a single goal without GPU support, we ultimately decided to conduct our tests exclusively using GPU acceleration.

# 5.4 Results

The experimental results are organized around the two main components of the system: goal classification (Section 5.4.1) and play classification (Section 5.4.2). Within Section 5.4.1, we also address the third component, shot classification, and discuss additional factors that contributed to the limited performance observed in goal classification.

For both the play classification and shot classification components, ground-truth labels were established through manual analysis, which enabled the computation of quantitative metrics for each class. Confusion matrices are presented to illustrate system performance on multi-class prediction tasks, highlighting correct classifications as well as the sources for the misclassifications.

Finally, in Section 5.4.3, we summarize the overall system performance. This includes presenting precision for the shot classification component, broken down by class and averaged across all classes, together with an analysis of execution time to assess the computational efficiency of the proposed approach.

## 5.4.1 Goal Classification

The evaluation of the goal classification component revealed significant challenges, with a resulting precision of only 17% (8 correct out of 45). Given the complexity of this task, these errors stem from a variety of factors, as goal classification is particularly sensitive to the accuracy of upstream modules, including shot detection, shot classification, object detection, touch detection, and pose estimation.

Firstly, while the TransNetV2 [29] for **shot boundary detection** was not extensively analyzed in detail, several issues emerged in this stage. Some incorrect detections were caused by corrupted video files that produced artifacts, while other errors involved missed shot transitions. There was also a high number of false detections during *other* shot segments (though most of these were irrelevant as such segments are later discarded). More critically, errors occasionally occurred when dividing important plays, particularly within *long* or *medium* shots, leading to two main issues. First, merging two distinct shots into one results in losing the first shot from the analysis. Second, incorrectly splitting one shot into

&lt;page_number&gt;47&lt;/page_number&gt;

---


## Page 68

two segments means the last touch in the initial segment is no longer the one that generated the goal. Both problems compromise the analysis, as only the last touch of each shot is used, and missing or misidentifying it reduces the available perspectives and can introduce errors in the final results.

Further challenges arose in the **shot classification** process itself. For example, relying on a fine-tuned model optimized for *long* shots led to poor performance when classifying misclassified closer camera angles. Inaccurate labeling of a shot as *other* would result in its exclusion from further analysis, potentially omitting relevant footage that might improve downstream results. To examine the shot classification component performance in detail, we used manual analysis, in the smaller subset of 45 games, and extracted the distribution of shot types shown in Table 5.3.

**Table 5.3:** Distribution of different types of shots in the smaller dataset (45 games).

<table>
<thead>
<tr>
<th>Type of shot</th>
<th>Quantity</th>
</tr>
</thead>
<tbody>
<tr>
<td>Long</td>
<td>59</td>
</tr>
<tr>
<td>Medium</td>
<td>107</td>
</tr>
<tr>
<td>Other</td>
<td>119</td>
</tr>
</tbody>
</table>

The performance of the shot classifier, evaluated on segments identified by shot detection, is presented in Figure 5.1 as a confusion matrix. This figure illustrates the classifier’s ability to distinguish among *long*, *medium*, and *other* shots, and highlights the most frequent misclassifications.

**Figure 5.1:** Shot classifier confusion matrix.

&lt;img&gt;Confusion Matrix for Shot Classification&lt;/img&gt;

The next phase of the analysis focused on **object detection**, where the ball detection proved to be the predominant source of error. While occasional occlusions caused missed player detections or erroneously caught audience members, the main issue was reliably identifying the ball and tracking its trajectory. Frequently, the algorithm failed to detect the ball altogether, particularly when the ball was predominantly black, or mistakenly recognized unrelated objects. This misidentification was not limited

&lt;page_number&gt;48&lt;/page_number&gt;

---


## Page 69

to subtle errors: common confusions included gloves, boots, hands, socks, hair, captain armbands, broadcast overlay graphics, stadium lights, penalty marks, and even objects outside the field.

These errors led to incorrect trajectories as the system sometimes traced the movement of these false objects. Moreover, linear interpolation between missed ball detections was insufficient, as it often overlooked critical moments where the ball was actually touched by a player, affecting both touch detection and subsequent classification accuracy.

In the **touch detection** stage, slow-motion replays significantly contributed to missed detections. Even in regular-speed footage, tuning thresholds without considering camera perspective created difficulties, as some views capture less pronounced ball movement after contact. Occasionally, the system misidentified the exact moment of the touch or failed to select the appropriate sequence of frames around it, especially when off by a few frames, therefore, an additional logic should be developed to enhance the exactness of touch moment detection.

Occlusions from other players further complicated detection, sometimes obscuring the decisive touch and leading to errors in both detection and classification. Perspectives where the ball remains within the player’s bounding box can also mask movement, resulting in undetected touches. Besides missing detections, false detections were triggered by perspective effects, bounce dynamics, and the ball’s effect/spin, especially if it passed through a player’s bounding box without clear contact.

For **touch classification**, further limitations affected accuracy. Without mapping the broadcast footage to a virtual 3D field, the analysis had to rely solely on visual cues, which complicated the ability to conduct a more precise and comprehensive analysis. Classifying the body part responsible for a goal typically involved distinguishing between the right foot, the left foot, and the head, with occasional attempts to recognize rarer cases such as knee or shoulder touches. However, this was sometimes inconclusive, as distinguishing between head and shoulder contacts is challenging due to their proximity.

The performance of pose estimation models also played a critical role, and these models struggled particularly with blurred images, distant or overlapped players, and goalkeepers lying horizontally. For example, poor pose estimates during goalkeeper actions occasionally resulted in incorrect body part assignments. In a situation where a goalkeeper touches the ball with their hand, the model might mistakenly swap the hands with the feet, leading to an incorrect attribution of the scorer’s action.

Additionally, fixed cropping windows around the ball were sometimes inadequate, missing portions of the player involved in the scoring action, especially for headers, since normally from the camera perspectives the player is on the level with the ball and it needed more space on the upper space of the cropped area. Dynamically adjusting the crop window based on the bounding boxes of the proximity players could enhance the inclusion of the relevant players and thereby improve pose estimation reliability. Finally, refining classification thresholds (such as the required height difference between feet when kicking) remains an area for future development, as incorrect threshold settings can lead to ambiguous

&lt;page_number&gt;49&lt;/page_number&gt;

---


## Page 70

or inaccurate results.

Common errors also arose from **dataset limitations**, corrupted video files sometimes displayed digital artifacts; in rare cases, pre-goal shots failed to show the actual scoring touch, reducing confidence or even making the goal classification inconclusive. Occasionally, sequences continued beyond the moment the ball entered the goal, such as when a goalkeeper retrieved the ball from inside the net, further complicating the analysis and introducing uncertainty at the decisive moment.

## 5.4.2 Play Classification

For the play classification component, since no comparable automated benchmarks are available, the ground truth was established manually for all goals in the dataset. The distribution of play types, *long play*, *free kick*, *penalty*, and *corner kick*, across the 86 goals is presented in Table 5.4. This distribution highlights the predominance of *long play* goals, which account for nearly three-quarters of the dataset.

**Table 5.4:** Distribution of different types of plays in the dataset (86 games).

<table>
<thead>
<tr>
<th>Type of play</th>
<th>Quantity</th>
</tr>
</thead>
<tbody>
<tr>
<td>Long Play</td>
<td>66</td>
</tr>
<tr>
<td>Free Kick</td>
<td>6</td>
</tr>
<tr>
<td>Penalty</td>
<td>7</td>
</tr>
<tr>
<td>Corner</td>
<td>7</td>
</tr>
</tbody>
</table>

After establishing this ground truth, the predicted play labels generated by our algorithm were compared against them, and the results were used to construct the confusion matrix presented in Figure 5.2. The classifier demonstrates promising performance across the available play types, particularly for the more common *long plays* and *corner kicks*. Nonetheless, the limited diversity of samples for some categories, such as *free kicks* and *penalties*, constrains the classifier’s ability to generalize. With access to a larger and more diverse dataset, the accuracy of the model could be further improved, particularly by reducing misclassifications involving less represented play types.

&lt;page_number&gt;50&lt;/page_number&gt;

---


## Page 71

Figure 5.2: Play classifier confusion matrix.

&lt;img&gt;Confusion Matrix for Play Classifier&lt;/img&gt;

## 5.4.3 System Performance Summary

To provide a global perspective, Table 5.5 summarizes the precision achieved by both the shot classifier and the play classifier, broken down by class and overall averages. This consolidated view highlights the strengths of the system while also indicating areas where more data or model refinement could improve results.

<table>
<thead>
<tr>
<th>Component</th>
<th>Class</th>
<th>Precision (%)</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="4">Shot Classifier</td>
<td>Long</td>
<td>95</td>
</tr>
<tr>
<td>Medium</td>
<td>89</td>
</tr>
<tr>
<td>Other</td>
<td>86</td>
</tr>
<tr>
<td><strong>All</strong></td>
<td><strong>88</strong></td>
</tr>
<tr>
<td colspan="2"><strong>Average across classes</strong></td>
<td><strong>90</strong></td>
</tr>
</tbody>
</table>

<table>
<thead>
<tr>
<th>Component</th>
<th>Class</th>
<th>Precision (%)</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="4">Play Classifier</td>
<td>Long Play</td>
<td>93</td>
</tr>
<tr>
<td>Free Kick</td>
<td>66</td>
</tr>
<tr>
<td>Corner</td>
<td>100</td>
</tr>
<tr>
<td>Penalty</td>
<td>86</td>
</tr>
<tr>
<td colspan="2"><strong>All</strong></td>
<td><strong>91</strong></td>
</tr>
<tr>
<td colspan="2"><strong>Average across classes</strong></td>
<td><strong>86</strong></td>
</tr>
</tbody>
</table>

Table 5.5: Precision of each component and their classes.

Beyond precision, we evaluated runtime performance to assess the feasibility of a real-time application. On average, replays in the dataset lasted around 40 seconds, while the system required approximately 3.2 times that duration to process them. The heaviest component was the goal classifier, which includes object detection, touch detection, and touch classification (based on pose estimation results). This component required about 4 seconds of computation per second of *long* or *medium* shots. In contrast, the shot boundary detection and classification required approximately 0.2 seconds per second of video, and play classification averaged only 0.5 seconds per replay.

Overall, while replays with a greater proportion of *long* or *medium* shots tended to increase execution time, they also can provide more detailed information for goal classification, contributing to higher confidence in the final results.

&lt;page_number&gt;51&lt;/page_number&gt;

---


## Page 72

52

---


## Page 73

# 6

# Conclusion

## Contents

<table>
  <tr>
    <td>6.1 Conclusions</td>
    <td>55</td>
  </tr>
  <tr>
    <td>6.2 System Limitations</td>
    <td>55</td>
  </tr>
  <tr>
    <td>6.3 Future Work</td>
    <td>56</td>
  </tr>
</table>

&lt;page_number&gt;53&lt;/page_number&gt;

---


## Page 74

54

---


## Page 75

This chapter begins with a summary of our work and its results in Section 6.1, followed by a discussion of some key system limitations in Section 6.2, and concludes with directions for future work in Section 6.3.

## 6.1 Conclusions

This work demonstrated good performance in the play classification component, achieving high accuracy and enabling near real-time results when excluding the goal classification module. The system produces reliable outputs shortly after the transition to the second replay shot, requiring only frames from the beginning of the replay, which highlights the speed and efficiency of this processing stage.

However, despite these promising outcomes, considerable challenges remain in the goal classification component. Its precision remains low due to complex error propagation from multiple upstream components. Overcoming these limitations is critical for improving the overall system’s robustness and reliability.

## 6.2 System Limitations

The system is primarily designed to operate on cut replay video segments of goals and is not currently equipped to run directly from live broadcasts or real-time inputs. This limitation stems from the pipeline architecture, where the shot detection module requires processing the entire video before subsequent components, such as goal classification, can analyze the footage from start to finish. Hence, continuous or live inputs are not compatible with the current processing approach.

The system currently assumes that the last detected touch in a replay corresponds to the scoring touch, even if preliminary or pre-play shots precede it. This inability to differentiate between pre-play events and the decisive goal moment can sometimes cause inaccuracies in classification.

While the system accepts variable input resolutions, experiments indicate that although increasing resolution generally improves detection accuracy, increasing beyond $1280 \times 720$ pixels yields diminishing returns. This behavior is due to the intrinsic constraints of the detection models used and typical broadcast quality limits. Additionally, although a 60 Frames per Second (fps) video can more effectively capture ball movement with reduced motion blur, our analysis of videos at both 30 and 60 fps evaluates a similar number of frames and produces comparable results. This is because we implemented a uniform analysis method that extracts approximately the same number of frames per second from the input, excluding additional frames from videos with higher fps. Therefore, increasing frame rates alone also does not guarantee meaningful improvements in classification performance.

&lt;page_number&gt;55&lt;/page_number&gt;

---


## Page 76

Being the most complex module dependent on multiple antecedent components, the goal classification model is especially susceptible to error propagation. Imperfections in shot segmentation, object detection, and touch identification compound to undermine classification accuracy. Moreover, the absence of a dedicated slow-motion detection mechanism prevents the system from adapting touch detection thresholds for reduced ball speeds following contact, further limiting detection quality.

## 6.3 Future Work

Building upon the issues discussed in Section 5.4.1 regarding the goal classification module, several potential improvements can enhance both system effectiveness and efficiency:

*   Develop an improved ball detection model along with more sophisticated interpolation methods to enhance trajectory tracking, reducing false detections and missed ball observations, thereby improving subsequent touch analysis accuracy.
*   Incorporate a module to account for ball spin, gravity, and ground bounces to minimize false touch detections triggered by complex ball physics.
*   Implement specialized detection threshold adjustments for slow-motion segments, catering to variable ball speeds to increase touch detection recall and timing precision.
*   Refine shot selection criteria by excluding shots that are either too distant from the core play action or represent pre-play camera angles. This focus will improve computational efficiency and avoid including shots that are unlikely to yield an accurate result or even contain the goal-scoring touch.
*   Explore dynamic cropping strategies for the pose estimation module that adapt the crop size and position based on the player's location relative to the ball. Aiming to enhance pose estimation detection and, subsequently, the accuracy of classifying the body part responsible for the goal.
*   Optimize the detection and classification thresholds for goal touches to achieve a balance between sensitivity and specificity, thereby minimizing ambiguous or incorrect classifications.
*   Enhance the pipeline architecture to reduce dependence on complete replay availability, moving towards a design capable of near real-time or streaming input processing.

In addition to enhancing the goal classification component, several other improvements have been identified to boost both the goal classification and play classification components, as well as to strengthen the play classification component alone:

&lt;page_number&gt;56&lt;/page_number&gt;

---


## Page 77

- Fine-tune the TransNetV2 model specifically for the soccer context to minimize incorrect shot boundary detections, particularly for relevant shots like *long* and *medium* shots, while enhancing the detection of correct shot transitions.
- Expand the training dataset for the shot classification module to improve the classification of more challenging categories such as *medium* and *other* shots, which were the most frequent sources of misclassification.
- Increase the training data and refine the play classification model to better handle varied perspectives in second shots, and improve classification accuracy for less common play types, such as *free kick*, *penalty*, and *corner*.

&lt;page_number&gt;57&lt;/page_number&gt;

---


## Page 78

58

---


## Page 79

# Bibliography

[1] Ultralytics, “Ultralytics YOLO11 Has Arrived! Redefine What’s Possible in AI!” 2024, accessed: 13 December 2024. [Online]. Available: https://www.ultralytics.com/blog/ultralytics-yolo11-has-arrived-redefine-whats-possible-in-ai

[2] M. Gutiérrez-Pérez and A. Agudo, “Pnlcalib: Sports field registration via points and lines optimization,” arXiv preprint arXiv:2404.08401, 2024.

[3] A. Vina, “How to use Ultralytics YOLO11 for pose estimation,” 2024, accessed: 8 August 2025. [Online]. Available: https://www.ultralytics.com/blog/how-to-use-ultralytics-yolo11-for-pose-estimation

[4] P. C. Jardim, L. M. P. Moraes, and C. D. Aguiar, “QASports: A question answering dataset about sports,” in Dataset Showcase Workshop (DSW). SBC, 2023, pp. 1–12.

[5] S. C. Nnadi and K. L. Nwadialor, “Soccer’s holy grail: Interrogating the preponderance of fandom over faith in the age of globalization,” OKH Journal: Anthropological Ethnography and Analysis Through the Eyes of Christian Faith, vol. 9, no. 1, pp. 39–51, 2025.

[6] G. Kitching, “The origins of football: History, ideology and the making of ‘the people’s game’,” in History Workshop Journal, vol. 79, no. 1. Oxford University Press, 2015, pp. 127–153.

[7] Study.com, “The origins & evolution of soccer,” 2023, accessed: 14 November 2024. [Online]. Available: https://study.com/academy/lesson/the-origins-evolution-of-soccer.html

[8] D. O. Shomuyiwa, O. T. Ajayi, M. Jitanan, S. S. Musa, E. R. Gregorio Jr, E. Manirambona, M. Tamang, A. U. Sow, D. Ledra, T. Phungdee et al., “The FIFA World Cup as a Tool for Global Health Diplomacy,” Public Health Challenges, vol. 2, no. 3, p. e106, 2023.

[9] Z. Pu, Y. Pan, S. Wang, B. Liu, M. Chen, H. Ma, and Y. Cui, “Orientation and decision-making for soccer based on sports analytics and AI: A systematic review,” IEEE/CAA Journal of Automatica Sinica, vol. 11, no. 1, pp. 37–57, 2024.

[10] K. Rathi, P. Somani, A. V. Koul, and K. Manu, “Applications of artificial intelligence in the game of football: The global perspective,” Researchers World, vol. 11, no. 2, pp. 18–29, 2020.

&lt;page_number&gt;59&lt;/page_number&gt;

---


## Page 80

[11] T. D’Orazio and M. Leo, “A review of vision-based systems for soccer video analysis,” *Pattern recognition*, vol. 43, no. 8, pp. 2911–2926, 2010.

[12] S. Akan and S. Varlı, “Use of deep learning in soccer videos analysis: survey,” *Multimedia Systems*, vol. 29, no. 3, pp. 897–915, 2023.

[13] J. G. Rodenas, R. A. Malavés, A. T. Desantes, E. S. Ramírez, J. C. Hervás, and R. A. Malavés, “Past, present and future of goal scoring analysis in professional soccer,” *Retos: nuevas tendencias en educación física, deporte y recreación*, no. 37, pp. 774–785, 2020.

[14] F. Bayat, M. S. Moin, and F. Bayat, “Goal detection in soccer video: Role-based events detection approach,” *International Journal of Electrical and Computer Engineering*, vol. 4, no. 6, p. 979, 2014.

[15] M. B. Jurca and I. Giosan, “A modern approach for positional football analysis using computer vision,” in *2022 IEEE 18th International Conference on Intelligent Computer Communication and Processing*. IEEE, 2022, pp. 275–282.

[16] R. Psiuk, T. Seidl, W. Strauß, and J. Bernhard, “Analysis of goal line technology from the perspective of an electromagnetic field based approach,” *Procedia Engineering*, vol. 72, pp. 279–284, 2014.

[17] I. Tamir and M. Bar-Eli, “The moral gatekeeper: Soccer and technology, the case of Video Assistant Referee (VAR),” *Frontiers in Psychology*, vol. 11, p. 613469, 2021.

[18] M. Winand and C. Ferguson, “More decision-aid technology in sport? An analysis of football supporters’ perceptions on goal-line technology,” *Soccer & Society*, vol. 19, no. 7, pp. 966–985, 2018.

[19] S. Lartey, “Analyzing the Challenges and Benefits of VAR Usage in Football: A Comprehensive Examination,” 09 2024.

[20] Z. Bai and X. Bai, “Sports big data: management, analysis, applications, and challenges,” *Complexity*, vol. 2021, no. 1, p. 6676297, 2021.

[21] M. Stein, H. Janetzko, A. Lamprecht, T. Breitkreutz, P. Zimmermann, B. Goldlücke, T. Schreck, G. Andrienko, M. Grossniklaus, and D. A. Keim, “Bring it to the pitch: Combining video and movement data to enhance team sport analysis,” *IEEE Transactions on Visualization and Computer Graphics*, vol. 24, no. 1, pp. 13–22, 2017.

[22] T. Kar, P. Kanungo, S. N. Mohanty, S. Groppe, and J. Groppe, “Video shot-boundary detection: issues, challenges and solutions,” *Artificial Intelligence Review*, vol. 57, no. 4, p. 104, 2024.

[23] H. Zhang, A. Kankanhalli, and S. W. Smoliar, “Automatic partitioning of full-motion video,” *Multimedia systems*, vol. 1, no. 1, pp. 10–28, 1993.

&lt;page_number&gt;60&lt;/page_number&gt;

---


## Page 81

[24] K. Otsuji and Y. Tonomura, “Projection detecting filter for video cut detection,” in *Proceedings of the first ACM international conference on Multimedia*, 1993, pp. 251–257.

[25] R. Zabih, J. Miller, and K. Mai, “A feature-based algorithm for detecting and classifying scene breaks,” in *Proceedings of the Third ACM International Conference on Multimedia*, 1995, pp. 189–200.

[26] T. Kar and P. Kanungo, “Video shot boundary detection based on Hilbert and wavelet transform,” in *2017 2nd International Conference on Man and Machine Interfacing*. IEEE, 2017, pp. 1–6.

[27] M. Birinci and S. Kiranyaz, “A perceptual scheme for fully automatic video shot boundary detection,” *Signal Processing: Image Communication*, vol. 29, no. 3, pp. 410–423, 2014.

[28] B. Lungisani, E. Thuma, and G. Malema, “A classification approach to video shot boundary detection,” *International Journal of Signal Processing, Image Processing and Pattern Recognition*, vol. 10, no. 12, pp. 103–118, 2017.

[29] T. Soucek and J. Lokoc, “TransNet V2: An effective deep network architecture for fast shot transition detection,” in *Proceedings of the 32nd ACM International Conference on Multimedia*, 2024, pp. 11218–11221.

[30] L. Baraldi, C. Grana, and R. Cucchiara, “Shot and scene detection via hierarchical clustering for reusing broadcast video,” in *International conference on computer analysis of images and patterns*. Springer, 2015, pp. 801–811.

[31] M. Gygli, “Ridiculously fast shot boundary detection with fully convolutional neural networks,” in *2018 International Conference on Content-Based Multimedia Indexing*. IEEE, 2018, pp. 1–4.

[32] T. Souček, J. Moravec, and J. Lokoč, “TransNet: A deep network for fast detection of common shot transitions,” *arXiv preprint arXiv:1906.03363*, 2019.

[33] A. Ekin, A. M. Tekalp, and R. Mehrotra, “Automatic soccer video analysis and summarization,” *IEEE Transactions on Image processing*, vol. 12, no. 7, pp. 796–807, 2003.

[34] Y.-H. Zhou, Y.-D. Cao, L.-F. Zhang, and H.-X. Zhang, “An svm-based soccer video shot classification,” in *2005 International Conference on Machine Learning and Cybernetics*, vol. 9. IEEE, 2005, pp. 5398–5403.

[35] T. Fang and S. Ping, “Attractive events detection in soccer videos based on identification of shots,” in *3rd International Conference on Multimedia Technology (ICMT-13)*. Atlantis Press, 2013, pp. 807–815.

&lt;page_number&gt;61&lt;/page_number&gt;

---


## Page 82

[36] M. H. Sarkhoosh, S. Gautam, C. Midoglu, S. S. Sabet, and P. Halvorsen, “Multimodal ai-based summarization and storytelling for soccer on social media,” in *Proceedings of the 15th ACM multimedia systems conference*, 2024, pp. 485–491.

[37] Y. Li, G. Liu, and X. Qian, “Ball and field line detection for placed kick refinement,” in *2009 WRI Global Congress on Intelligent Systems*, vol. 4. IEEE, 2009, pp. 404–407.

[38] F. Vidal-Codina, N. Evans, B. El Fakir, and J. Billingham, “Automatic event detection in football using tracking data,” *Sports Engineering*, vol. 25, no. 1, p. 18, 2022.

[39] L.-Y. Duan, M. Xu, X.-D. Yu, and Q. Tian, “A unified framework for semantic shot classification in sports videos,” in *Proceedings of the tenth ACM international conference on Multimedia*, 2002, pp. 419–420.

[40] A. Karimi, R. Toosi, and M. A. Akhaee, “Soccer event detection using deep learning,” *arXiv preprint arXiv:2102.04331*, 2021.

[41] M. Tan and Q. Le, “Efficientnet: Rethinking model scaling for convolutional neural networks,” in *International conference on machine learning*. PMLR, 2019, pp. 6105–6114.

[42] N. Jegham, C. Y. Koh, M. Abdelatti, and A. Hendawi, “Evaluating the evolution of yolo (you only look once) models: A comprehensive benchmark study of yolo11 and its predecessors,” *arXiv preprint arXiv:2411.00201*, 2024.

[43] ——, “YOLO evolution: A comprehensive benchmark and architectural review of YOLOv12, YOLO11, and their previous versions,” *arXiv preprint arXiv:2411.00201*, 2024.

[44] R. Khanam and M. Hussain, “Yolov11: An overview of the key architectural enhancements,” *arXiv preprint arXiv:2410.17725*, 2024.

[45] D. Maji, S. Nagori, M. Mathew, and D. Poddar, “YOLO-pose: Enhancing yolo for multi person pose estimation using object keypoint similarity loss,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2022, pp. 2637–2646.

[46] Z. Cao, G. Hidalgo, T. Simon, S.-E. Wei, and Y. Sheikh, “Openpose: Realtime multi-person 2D pose estimation using part affinity fields,” *IEEE Transactions on Pattern Analysis and Machine Intelligence*, vol. 43, no. 1, pp. 172–186, 2019.

[47] C. Yeung, K. Ide, and K. Fujii, “Autosoccerpose: Automated 3D posture analysis of soccer shot movements,” in *Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition*, 2024, pp. 3214–3224.

&lt;page_number&gt;62&lt;/page_number&gt;

---


## Page 83

[48] G. C. Bian, “Soccer last touch and automatic event detection with skeletal tracking data,” Ph.D. dissertation, Massachusetts Institute of Technology, 2024.

[49] T. Rianthong, S. Thewsuwan, T. Charoenpong, and K. Pattanaworapan, “A method for detecting lines on soccer field by color of grass variation,” in *2020 12th International Conference on Knowledge and Smart Technology*. IEEE, 2020, pp. 131–134.

[50] D. Berjón, C. Cuevas, and N. García, “Soccer line mark segmentation and classification with stochastic watershed transform,” *Signal Processing: Image Communication*, vol. 118, p. 117014, 07 2023.

[51] M. S. Marques, R. G. Faria, P. Santos, and J. H. Brito, “Soccer pitch areas segmentation with hierarchical u-net on the soccernet dataset,” in *2023 15th International Conference on Electronics, Computers and Artificial Intelligence*. IEEE, 2023, pp. 01–08.

[52] C. Cuevas, D. Berjón, and N. García, “A fully automatic method for segmentation of soccer playing fields,” *Scientific Reports*, vol. 13, no. 1, p. 1464, 2023.

[53] N. Homayounfar, S. Fidler, and R. Urtasun, “Soccer field localization from a single image,” *arXiv preprint arXiv:1604.02715*, 2016.

[54] C. Cuevas, D. Quilon, and N. García, “Automatic soccer field of play registration,” *Pattern Recognition*, vol. 103, p. 107278, 2020.

[55] N. S. Falaleev and R. Chen, “Enhancing soccer camera calibration through keypoint exploitation,” in *Proceedings of the 7th ACM International Workshop on Multimedia Content Analysis in Sports*, 2024, pp. 65–73.

[56] S. Agrawal, R. Sundararajan, and V. Sagar, “Accurate tennis court line detection on amateur recorded matches,” *arXiv preprint arXiv:2404.06977*, 2024.

[57] U. Sara, M. Akter, and M. S. Uddin, “Image quality assessment through FSIM, SSIM, MSE and PSNR—a comparative study,” *Journal of Computer and Communications*, vol. 7, no. 3, pp. 8–18, 2019.

[58] J. Xiao, J. Hays, K. A. Ehinger, A. Oliva, and A. Torralba, “Sun database: Large-scale scene recognition from abbey to zoo,” in *2010 IEEE Computer Society Conference on Computer Vision and Pattern Recognition*. IEEE, 2010, pp. 3485–3492.

[59] F. C. Akyon, S. O. Altinuc, and A. Temizel, “Slicing aided hyper inference and fine-tuning for small object detection,” in *2022 IEEE International Conference on Image Processing*. IEEE, 2022, pp. 966–970.

&lt;page_number&gt;63&lt;/page_number&gt;

---


## Page 84

[60] S. Tarashima, M. A. Haq, Y. Wang, and N. Tagawa, “Widely applicable strong baseline for sports ball detection and tracking,” *arXiv preprint arXiv:2311.05237*, 2023.

[61] M. Petersson and N. Kifle Solomon, “Object tracking evaluation: Bot-sort & bytetrack with yolov8: A comparison of accuracy and computational efficiency,” 2024.

[62] J. Terven, D.-M. Córdova-Esparza, and J.-A. Romero-González, “A comprehensive review of YOLO architectures in computer vision: From YOLOv1 to YOLOv8 and YOLO-NAS,” *Machine learning and Knowledge Extraction*, vol. 5, no. 4, pp. 1680–1716, 2023.

[63] H. Fei, “Human Posture Detection Model Based on Improved YOLO11-Pose,” in *2025 IEEE 5th International Conference on Electronic Technology, Communication and Information*. IEEE, 2025, pp. 1420–1424.

&lt;page_number&gt;64&lt;/page_number&gt;

---


## Page 85

65