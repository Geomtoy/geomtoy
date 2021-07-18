
## 关于矩阵
### 矩阵
由$m\times n$个数排成的$m$行（水平）$n$列（垂直）的数表，称为$m$行$n$列的矩阵，简称$m\times n$矩阵。记作：

$$\mathbf A=\begin{bmatrix}a_{11}&a_{12}&\cdots&a_{1n}\\a_{21}&a_{22}&\cdots&a_{2n}\\\vdots&\vdots&\ddots&\vdots\\a_{m1}&a_{m2}&\cdots&a_{mn}\end{bmatrix}$$


这$m \times n$个数称为矩阵$\mathbf A$的元素，数$a_{ij}$位于矩阵$\mathbf A$的第$i$行第$j$列，
$m\times n$矩阵$\mathbf A$也记作$\mathbf A_{mn}$。

行数与列数都等于$n$的矩阵称为$n$阶矩阵。

### 矩阵加法
只有同型矩阵之间才可以进行加法。
如:
$$\begin{bmatrix}1&4&2\\2&0&0\end{bmatrix}+\begin{bmatrix}0&0&5\\7&5&0\end{bmatrix}=\begin{bmatrix}1+0&4+0&2+5\\2+7&0+5&0+0\end{bmatrix}=\begin{bmatrix}1&4&7\\9&5&0\end{bmatrix}$$


矩阵加法满足（$\mathbf A$，$\mathbf B$，$\mathbf C$都是同型矩阵）：

交换律：
$$\mathbf A+\mathbf B=\mathbf B+\mathbf A$$

结合律：
$$(\mathbf A+\mathbf B)+\mathbf C=\mathbf A+(\mathbf B+\mathbf C)$$


### 矩阵乘法
两个矩阵的乘法仅当第一个矩阵$\mathbf A$的列数和另一个矩阵$\mathbf B$的行数相等时才能定义。

如$\mathbf A$是$m\times n$矩阵，$\mathbf B$是$n \times p$矩阵，它们的乘积$\mathbf C$是一个$m \times p$矩阵 ，它的一个元素：

$$\mathbf C_{i,j}=[\mathbf {AB}]_{i,j}=a_{i,1}b_{1,j}+a_{i,2}b_{2,j}+\cdots+a_{i,n}b_{n,j}=\sum _{r=1}^{n}a_{i,r}b_{r,j}$$

如：

$$\begin{bmatrix}1&0&2\\-1&3&1\end{bmatrix}\times\begin{bmatrix}3&1\\2&1\\1&0\end{bmatrix}=\begin{bmatrix}1\times3+0\times2+2\times1&1\times1+0\times1+2\times0\\-1\times3+3\times2+1\times1&-1\times1+3\times1+1\times0\end{bmatrix}=\begin{bmatrix}5&1\\4&2\end{bmatrix}$$
矩阵乘法满足：

结合律：
$$(\mathbf A\mathbf B)\mathbf C=\mathbf A(\mathbf B\mathbf C)$$

左分配律：
$$(\mathbf A+\mathbf B)\mathbf C=\mathbf A\mathbf C+\mathbf B\mathbf C$$

左分配律：
$$\mathbf C(\mathbf A+\mathbf B)=\mathbf C\mathbf A+\mathbf C\mathbf B$$

矩阵乘法不满足交换律，即：$\mathbf{AB}\neq\mathbf{BA}$

### 单位矩阵
主对角线上的元素都为$1$，其余元素全为$0$的$n$阶矩阵称为$n$阶单位矩阵，记为 $\mathbf {I_n}$
$$\mathbf {I_3}=\begin{bmatrix}1&0&0\\0&1&0\\0&0&1\end{bmatrix}$$

## 2D变换
2D变换采用为了方便计算，采用齐次坐标系（Homogeneous Coordinates），即将一个点的坐标从$\begin{bmatrix} x\\y\end{bmatrix}$增加一维变成为$\begin{bmatrix} x\\y\\1\end{bmatrix}$，这样方便与2D变化矩阵进行矩阵乘法。

2D变换矩阵：

$$\begin{bmatrix}a&c&e\\b&d&f\\0&0&1\end{bmatrix}$$

变换采用矩阵乘法，所以

$$\begin{bmatrix}a&c&e\\b&d&f\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}ax+cy+e\\bx+dy+f\\1\end{bmatrix}$$


### 平移矩阵
设在x，y方向的平移量（移动距离）分别为：$t_x$，$t_y$，则平移矩阵为：

$$\begin{bmatrix}1&0&t_x\\0&1&t_y\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}1&0&t_x\\0&1&t_y\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}x+t_x\\y+t_y\\1\end{bmatrix}$$

### 缩放矩阵
设在x，y方向的缩放量（缩放比例）分别为：$s_x$，$s_y$，则缩放矩阵为：

$$\begin{bmatrix}s_x&0&0\\0&s_y&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}s_x&0&0\\0&s_y&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}s_xx\\s_yy\\1\end{bmatrix}$$

### 旋转矩阵
设旋转角度为$\theta$，则旋转矩阵为：
$$\begin{bmatrix}\cos(\theta)&-\sin(\theta)&0\\\sin(\theta)&\cos(\theta)&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}\cos(\theta)&-\sin(\theta)&0\\\sin(\theta)&\cos(\theta)&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}\cos(\theta)x-\sin(\theta)y\\\sin(\theta)x+cos(\theta)y\\1\end{bmatrix}$$

注：上面是`左手系`，顺时针为正角的矩阵，
若是`右手系`，逆时针为正角，则旋转矩阵为：
$$\begin{bmatrix}\cos(\theta)&\sin(\theta)&0\\-\sin(\theta)&\cos(\theta)&0\\0&0&1\end{bmatrix}$$

### 倾斜矩阵
设在x方向的倾斜角为$\alpha$，在y方向的倾斜角$\beta$，为则倾斜矩阵为：

$$\begin{bmatrix}1&\tan(\alpha)&0\\tan(\beta)&1&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}1&\tan(\alpha)&0\\tan(\beta)&1&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}x+\tan(\alpha)y\\\tan(\beta)x+y\\1\end{bmatrix}$$

### 反射矩阵

#### 点反射

设反射点$O(x_0,y_0)$，当前点$A(x, y)$，反射完之后的点$B(x',y')$

则点$B$在$A$和点$O$构成的直线上，且$O$是线段$AB$的中点：

$$\begin{cases}x_0=\frac{x+x'}{2}\\y_0=\frac{y+y'}{2}\end{cases}$$
则：
$$\begin{cases}x'=2x_0-x\\y'=2y_0-y\end{cases}$$

矩阵：
$$\begin{bmatrix}-1&0&2x_0\\0&-1&2y_0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}-1&0&2x_0\\0&-1&2y_0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}2x_0-x\\2y_0-y\\1\end{bmatrix}$$

特别地，当$O$为原点$(0,0)$时，
$$\begin{bmatrix}-1&0&0\\0&-1&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}-1&0&0\\0&-1&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}-x\\-y\\1\end{bmatrix}$$

#### 线反射
设反射轴（线）$L$为$ax+by+c=0$，当前点$A(x, y)$，反射完之后的点$B(x',y')$
则$AB$的中点在直线L上，且$AB$所在直线与L的斜率乘积为-1：

$$\begin{cases}a\frac{x+x'}{2}+b\frac{x+x'}{2}+c=0\\\frac{y-y'}{x-x'}=\frac{b}{a}\end{cases}$$
则：
$$\begin{cases}x'=\frac{(b^2-a^2)x-2aby-2ac}{a^2+b^2}=\frac{-2ac}{a^2+b^2}+\frac{b^2-a^2}{a^2+b^2}x-\frac{2ab}{a^2+b^2}y\\y'=\frac{(a^2-b^2)y-2abx-2bc}{a^2+b^2}=\frac{-2bc}{a^2+b^2}-\frac{2ab}{a^2+b^2}x+\frac{a^2-b^2}{a^2+b^2}y \end{cases}$$


矩阵：
$$\begin{bmatrix}\frac{b^2-a^2}{a^2+b^2}&-\frac{2ab}{a^2+b^2}&\frac{-2ac}{a^2+b^2}\\-\frac{2ab}{a^2+b^2}&\frac{a^2-b^2}{a^2+b^2}&\frac{-2bc}{a^2+b^2}\\0&0&1\end{bmatrix}$$


特别地：
- 沿y轴($x=0,b=c=0$)反射：
$$\begin{bmatrix}-1&0&0\\0&1&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}-1&0&0\\0&1&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}-x\\y\\1\end{bmatrix}$$


- 沿x轴($y=0,a=c=0$)反射：
$$\begin{bmatrix}1&0&0\\0&-1&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}1&0&0\\0&-1&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}x\\-y\\1\end{bmatrix}$$


- 沿`Line(y=x,-a/b=1 c=0)`反射：
$$\begin{bmatrix}0&1&0\\1&0&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}0&1&0\\1&0&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}y\\x\\1\end{bmatrix}$$

- 沿`Line(y=-x,a/b=1 c=0)`反射：
$$\begin{bmatrix}0&-1&0\\-1&0&0\\0&0&1\end{bmatrix}$$
$$\begin{bmatrix}0&-1&0\\-1&0&0\\0&0&1\end{bmatrix}\times\begin{bmatrix} x\\y\\1\end{bmatrix}=\begin{bmatrix}-y\\-x\\1\end{bmatrix}$$





